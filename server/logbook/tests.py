from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import Group
from django.conf import settings
from django.db import connection, transaction
from django.core.management import call_command

from users.models import User
from logbook.models import Carrier
from rest_framework.exceptions import APIException


class RequestFailedError(APIException):
    status_code = 400
    default_detail = "A server error occurred."
    default_code = "service_unavailable"


class MissingItemError(APIException):
    status_code = 400
    default_detail = "Item not found."
    default_code = "not_found"


class MaintainCarriersTests(TestCase):
    @classmethod
    def setUpClass(cls):
        # Create the collation first before any migrations run
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "CREATE COLLATION IF NOT EXISTS case_insensitive (provider = icu, locale = 'und-u-ks-level2', deterministic = false);"
                )
        except Exception as e:
            raise Exception(f"Failed to create collation: {e}. Ensure PostgreSQL has ICU extension installed.")

        # Now run migrations
        call_command("migrate", "core", verbosity=0)

        super().setUpClass()
        cls.carrier_admin_group = Group.objects.create(name=settings.CARRIER_ADMIN_GROUP)

    @classmethod
    def tearDownClass(cls):
        try:
            with connection.cursor() as cursor:
                cursor.execute("DROP COLLATION IF EXISTS case_insensitive")
        except Exception as e:
            print(f"Could not drop collation: {e}")
        super().tearDownClass()

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="admin@example.com", password="password123")
        self.client.force_authenticate(user=self.user)

    def test_create_carrier_success(self):
        payload = {
            "email": "carrieradmin@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "securepass",
            "name": "New Carrier",
        }
        response = self.client.post("/api/carriers/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Carrier added successfully")
        carrier = Carrier.objects.get(name="New Carrier")
        self.assertIsNotNone(carrier)
        self.assertEqual(carrier.admin.email, "carrieradmin@example.com")

    def test_create_carrier_user_exists(self):
        User.objects.create_user(email="existing@example.com", password="password")
        payload = {
            "email": "existing@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "securepass",
            "name": "New Carrier",
        }
        response = self.client.post("/api/carriers/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Error, user with this email already exists")

    def test_create_carrier_carrier_exists(self):
        Carrier.objects.create(name="Existing Carrier", admin=self.user)
        payload = {
            "email": "carrieradmin@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "securepass",
            "name": "Existing Carrier",
        }
        response = self.client.post("/api/carriers/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Error, carrier with this name already exists")

    def test_update_carrier_success(self):
        carrier = Carrier.objects.create(name="Old Carrier", admin=self.user)
        payload = {
            "id": carrier.id,
            "name": "Updated Carrier",
            "email": "updated@example.com",
        }
        response = self.client.patch("/api/carriers/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Carrier updated successfully")
        updated_carrier = Carrier.objects.get(id=carrier.id)
        self.assertEqual(updated_carrier.name, "Updated Carrier")
        self.assertEqual(updated_carrier.admin.email, "updated@example.com")

    def test_update_carrier_not_found(self):
        payload = {
            "id": 999,
            "name": "Updated Carrier",
            "email": "updated@example.com",
        }
        response = self.client.patch("/api/carriers/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Error, invalid carrier selected")

    def test_get_carriers(self):
        Carrier.objects.create(name="Carrier 1", admin=self.user)
        Carrier.objects.create(name="Carrier 2", admin=self.user)
        response = self.client.get("/api/carriers/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["carriers_data"]), 2)
