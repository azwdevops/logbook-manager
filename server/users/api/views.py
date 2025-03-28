from django.db import transaction
from django.contrib.auth import authenticate, login, logout

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response

from users.api.serializers import UserSerializer, UserViewSerializer
from core.exceptions import MissingItemError


class UserSignup(APIView):
    permission_classes = (AllowAny,)

    @transaction.atomic
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_user = serializer.save()

        new_user.set_password(request.data["password"])
        new_user.save()

        authenticate(username=request.data["email"], password=request.data["password"])

        user_data = UserViewSerializer(new_user).data

        return Response({"message": "Signed up successfully", "user_data": user_data}, status=201)


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

        return Response({"message": "Login successful", "user_data": user_data}, status=200)


class UserLogout(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        logout(request)
        return Response(status=200)


class UserView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    ##

    def get(self, request):
        serializer = UserViewSerializer(request.user)
        return Response({"user_data": serializer.data}, status=200)
