from rest_framework.serializers import ModelSerializer

from users.models import User


# Serializer for user creation or updating
class UserSerializer(ModelSerializer):
    class Meta:
        model = User  # The model this serializer is for
        fields = (
            "first_name",
            "last_name",
            "email",
            "driver_number",
            "driver_initials",
        )  # Fields to include in the serialized output


# Serializer for displaying user details (for views or listing users)
class UserViewSerializer(ModelSerializer):
    class Meta:
        model = User  # The model this serializer is for
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "driver_initials",
            "driver_number",
        )  # Fields to include in the serialized output
