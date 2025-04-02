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
    current_users_groups = []  # Initialize an empty list to store the group names the user belongs to
    # Get all active groups and prefetch the related user set for efficient querying
    user_groups = Group.objects.prefetch_related("user_set").filter(is_active=True)

    # Iterate through each active group to check if the user is a member of the group
    for group in user_groups:
        if user in group.user_set.all():  # Check if the user is in the current group
            current_users_groups.append(group.name)  # Add the group name to the list if the user is a member

    # Return the list of group names the user belongs to
    return current_users_groups


class UserLogin(APIView):
    permission_classes = (AllowAny,)  # Allows any user (authenticated or not) to access this view
    authentication_classes = (SessionAuthentication,)  # Uses session-based authentication

    def post(self, request):
        data = request.data  # Extract request data (contains email and password)
        # Attempt to authenticate the user using the provided email and password
        user = authenticate(username=request.data["email"], password=request.data["password"])

        if not user:  # If authentication fails, raise an error with a custom message
            raise MissingItemError("Invalid login", status_code=400)

        # Log the user in by creating a session
        login(request, user)

        # Serialize user data using the UserViewSerializer
        user_data = UserViewSerializer(user).data
        # Add additional user group information to the user data
        user_data = {**user_data, "user_groups": user_member_groups(request.user)}

        # Return a successful login response with the user data and a success message
        return Response({"message": "Login successful", "user_data": user_data}, status=200)


class UserLogout(APIView):
    permission_classes = (AllowAny,)  # Allows any user (authenticated or not) to access this view
    authentication_classes = ()  # No authentication required for logging out

    def post(self, request):
        logout(request)  # Logs out the user by terminating the session

        # Return a response with a 200 status code indicating successful logout
        return Response(status=200)


class MaintainUser(APIView):
    permission_classes = (IsAuthenticated,)  # Requires the user to be authenticated to access this view
    authentication_classes = (SessionAuthentication,)  # Uses session-based authentication

    @transaction.atomic  # Ensures that the update operation is atomic (i.e., either fully succeed or fully fail)
    def patch(self, request):
        # Get the user object by its ID from the request data. If not found, raise an error
        user = get_object_or_none(User, id=request.data["id"])
        if not user:  # If user not found, raise a custom error with a message
            raise MissingItemError("Error, invalid user account", status_code=400)

        # Initialize the serializer with the existing user data and the updated data from the request
        serializer = UserSerializer(user, data=request.data)
        # Validate the data and raise an exception if the data is invalid
        serializer.is_valid(raise_exception=True)
        # Save the updated user data to the database
        serializer.save()

        # Return a success response indicating that the user was updated successfully
        return Response({"message": "User updated successfully"}, status=200)

    def get(self, request):
        # Serialize the current authenticated user's data
        user_data = UserViewSerializer(request.user).data
        # Add the groups the current user is a member of to the user data
        user_data = {**user_data, "user_groups": user_member_groups(request.user)}

        # Return the serialized user data along with user group information
        return Response({"user_data": user_data}, status=200)


@api_view(["POST"])  # This view only allows POST requests
@permission_classes([IsAuthenticated])  # Ensures that the user must be authenticated to change the password
@transaction.atomic  # Ensures that the password change operation is atomic (either fully succeed or fail)
def change_password(request):
    # Check if the provided old password matches the user's current password
    if not check_password(request.data["old_password"], request.user.password):
        # If the old password is incorrect, raise an error with a custom message
        raise RequestFailedError("Old password entered is incorrect", status_code=400)

    # Set the new password for the user
    request.user.set_password(request.data["new_password"])
    # Save the user with the new password to the database
    request.user.save()

    # Return a success response indicating that the password was changed successfully
    return Response({"message": "Password changed successfully"}, status=200)


class MaintainDrivers(APIView):
    permission_classes = [IsAuthenticated]  # Ensures that the user must be authenticated to access this view

    @transaction.atomic  # Ensures that the driver creation operation is atomic (either fully succeed or fail)
    def post(self, request):
        # Initialize the serializer with the incoming data for a new driver
        serializer = UserSerializer(data=request.data)
        # Validate the data, raising an exception if invalid
        serializer.is_valid(raise_exception=True)
        # Save the new driver object
        new_driver = serializer.save()
        # Set the driver's password
        new_driver.set_password(request.data["password"])
        # Assign the carrier to the user based on the logged-in user's carrier
        new_driver.carrier = request.user.carrier
        new_driver.is_driver = True  # Mark the user as a driver
        # Save the new driver object with updated details
        new_driver.save()

        # Retrieve the driver group from the settings and add the new driver to it
        driver_group = Group.objects.get(name=settings.DRIVER_GROUP)
        driver_group.user_set.add(new_driver)

        # Serialize the new driver data for the response
        new_driver_data = UserViewSerializer(new_driver).data

        # Return a success response with the new driver's data
        return Response({"message": "Driver added successfully", "new_driver_data": new_driver_data}, status=201)

    @transaction.atomic  # Ensures that the driver update operation is atomic (either fully succeed or fail)
    def patch(self, request):
        # Retrieve the driver to update based on the provided ID
        driver = get_object_or_none(User, id=request.data["id"])
        # If no driver is found, raise an error
        if not driver:
            raise MissingItemError("Error, invalid driver selected", status_code=400)
        # Initialize the serializer with the existing driver and the updated data
        serializer = UserSerializer(driver, data=request.data)
        # Validate the updated data, raising an exception if invalid
        serializer.is_valid(raise_exception=True)
        # Save the updated driver details
        updated_driver = serializer.save()

        # Serialize the updated driver data for the response
        updated_driver_data = UserViewSerializer(updated_driver).data

        # Return a success response with the updated driver's data
        return Response(
            {"message": "Driver updated successfully", "updated_driver_data": updated_driver_data}, status=200
        )

    def get(self, request):
        # Retrieve the list of drivers associated with the logged-in user's carrier
        drivers = User.objects.filter(carrier=request.user.carrier, carrier__isnull=False, is_driver=True)
        # Serialize the list of drivers for the response
        drivers_data = UserViewSerializer(drivers, many=True).data

        # Return the list of drivers
        return Response({"message": "success", "drivers_data": drivers_data}, status=200)


@api_view(["GET"])  # This view responds to GET requests
@permission_classes([IsAuthenticated])  # Ensures that the user must be authenticated to access this view
def get_available_carrier_drivers(request):
    # Retrieve the list of available drivers who belong to the current user's carrier and are not assigned to any trips
    available_drivers = User.objects.filter(carrier=request.user.carrier, is_driver=True, driver_assigned=False)
    # Serialize the list of available drivers for the response
    available_drivers_data = UserViewSerializer(available_drivers, many=True).data

    # Retrieve the list of available trucks that belong to the current user's carrier and are not assigned to any trips
    available_trucks_data = Truck.objects.filter(carrier=request.user.carrier, truck_assigned=False).values(
        "id", "truck_number", "trailer_number"  # Only retrieve the relevant fields for each truck
    )

    # Return a success response with the available drivers and trucks data
    return Response(
        {
            "message": "success",  # Success message
            "available_drivers_data": available_drivers_data,  # Data of available drivers
            "available_trucks_data": available_trucks_data,  # Data of available trucks
        },
        status=200,  # HTTP status code for successful request
    )
