from django.db import transaction
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import Group
from django.contrib.auth.hashers import check_password
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from users.api.serializers import UserSerializer, UserViewSerializer
from core.exceptions import MissingItemError, RequestFailedError
from core.utils import get_object_or_none
from users.models import User
from logbook.models import Truck


def user_member_groups(user):
    current_users_groups = []
    user_groups = Group.objects.prefetch_related("user_set").filter(is_active=True)
    for group in user_groups:
        if user in group.user_set.all():
            current_users_groups.append(group.name)
    return current_users_groups


class UserLogin(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = (SessionAuthentication,)
    ##

    def post(self, request):
        data = request.data
        user = authenticate(username=request.data["email"], password=request.data["password"])
        if not user:
            raise MissingItemError("Invalid login", status_code=400)

        login(request, user)
        user_data = UserViewSerializer(user).data
        user_data = {**user_data, "user_groups": user_member_groups(request.user)}

        return Response({"message": "Login successful", "user_data": user_data}, status=200)


class UserLogout(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        logout(request)
        return Response(status=200)


class MaintainUser(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    @transaction.atomic
    def patch(self, request):
        user = get_object_or_none(User, id=request.data["id"])
        if not user:
            raise MissingItemError("Error, invalid user account", status_code=400)
        serializer = UserSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "User updated successfully"}, status=200)

    def get(self, request):
        user_data = UserViewSerializer(request.user).data
        user_data = {**user_data, "user_groups": user_member_groups(request.user)}
        return Response({"user_data": user_data}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def change_password(request):
    if not check_password(request.data["old_password"], request.user.password):
        raise RequestFailedError("Old password entered is incorrect", status_code=400)
    request.user.set_password(request.data["new_password"])
    request.user.save()

    return Response({"message": "Password changed successfully"}, status=200)


class MaintainDrivers(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_driver = serializer.save()
        new_driver.set_password(request.data["password"])
        new_driver.carrier = request.user.carrier
        new_driver.is_driver = True
        new_driver.save()

        driver_group = Group.objects.get(name=settings.DRIVER_GROUP)
        driver_group.user_set.add(new_driver)

        new_driver_data = UserViewSerializer(new_driver).data

        return Response({"message": "Driver added successfully", "new_driver_data": new_driver_data}, status=201)

    @transaction.atomic
    def patch(self, request):
        driver = get_object_or_none(User, id=request.data["id"])
        if not driver:
            raise MissingItemError("Error, invalid driver selected", status_code=400)
        serializer = UserSerializer(driver, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_driver = serializer.save()

        updated_driver_data = UserViewSerializer(updated_driver).data

        return Response(
            {"message": "Driver updated successfully", "updated_driver_data": updated_driver_data}, status=200
        )

    def get(self, request):
        drivers = User.objects.filter(carrier=request.user.carrier, carrier__isnull=False, is_driver=True)

        drivers_data = UserViewSerializer(drivers, many=True).data

        return Response({"message": "success", "drivers_data": drivers_data}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_available_carrier_drivers(request):
    available_drivers = User.objects.filter(carrier=request.user.carrier, is_driver=True, driver_assigned=False)
    available_drivers_data = UserViewSerializer(available_drivers, many=True).data
    available_trucks_data = Truck.objects.filter(carrier=request.user.carrier, truck_assigned=False).values(
        "id", "truck_number", "trailer_number"
    )

    return Response(
        {
            "message": "success",
            "available_drivers_data": available_drivers_data,
            "available_trucks_data": available_trucks_data,
        },
        status=200,
    )
