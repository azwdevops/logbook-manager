from rest_framework.serializers import ModelSerializer

from users.models import User


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "driver_number", "driver_initials", "truck_trailer_number")


class UserViewSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "driver_initials", "driver_number", "truck_trailer_number")
