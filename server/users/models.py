from django.db.models import Model, AutoField, EmailField, CharField, BooleanField, DateTimeField, ForeignKey, CASCADE
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group


# Custom User Manager for handling user creation and superuser creation
class UserManager(BaseUserManager):
    # Method to create a regular user with email and password
    def create_user(self, email, password=None):
        if not email:  # Ensure email is provided
            raise ValueError("An email is required.")
        if not password:  # Ensure password is provided
            raise ValueError("A password is required.")
        email = self.normalize_email(email)  # Normalize email to handle case insensitivity
        user = self.model(email=email)  # Create user model instance
        user.set_password(password)  # Set password (hashed)
        user.save()  # Save user to the database
        return user

    # Method to create a superuser (admin with full permissions)
    def create_superuser(self, email, password=None):
        if not email:  # Ensure email is provided
            raise ValueError("An email is required.")
        if not password:  # Ensure password is provided
            raise ValueError("A password is required.")
        user = self.create_user(email, password)  # Create a regular user first
        user.is_admin = True  # Set user as an admin
        user.is_staff = True  # Set user as staff (access to admin panel)
        user.is_superuser = True  # Set superuser privileges
        user.save()  # Save superuser to the database
        return user


# Custom User model to extend Django's AbstractBaseUser
class User(AbstractBaseUser, PermissionsMixin):
    id = AutoField(primary_key=True)  # Auto-incrementing primary key
    email = EmailField(
        max_length=100, unique=True, null=True, blank=True, db_collation="case_insensitive"
    )  # Email field (unique)
    first_name = CharField(max_length=50, null=True)  # First name
    last_name = CharField(max_length=50, null=True)  # Last name
    driver_number = CharField(
        max_length=100, unique=True, null=True, blank=True, db_collation="case_insensitive"
    )  # Unique driver number
    driver_initials = CharField(max_length=100, null=True, blank=True)  # Driver initials
    is_driver = BooleanField(default=False)  # Flag if user is a driver
    is_carrier_admin = BooleanField(default=False)  # Flag if user is a carrier admin
    driver_assigned = BooleanField(default=False)  # Flag if driver is assigned to a job
    is_admin = BooleanField(default=False)  # Flag if user is an admin
    is_active = BooleanField(default=True)  # Flag if the user is active
    is_staff = BooleanField(default=False)  # Flag if user has staff access (admin panel)
    created_at = DateTimeField(auto_now_add=True)  # Date when user was created
    last_login = DateTimeField(verbose_name="last login", auto_now=True)  # Last login timestamp
    carrier = ForeignKey("logbook.Carrier", on_delete=CASCADE, null=True, blank=True)  # Link to carrier (if applicable)

    USERNAME_FIELD = "email"  # Use email as the unique identifier for authentication

    # Attach the custom user manager
    objects = UserManager()

    def __str__(self):
        return self.email  # Return the email when displaying the user

    # Check if user has permission to perform a certain action
    def has_perm(self, perm, obj=None):
        return self.is_admin  # All admins have all permissions

    # Check if user has permissions to view a specific app
    def has_module_perms(self, app_label):
        return True  # Return True to allow access to any app


# Add extra fields to the default Django Group model (for custom group management)
Group.add_to_class("is_active", BooleanField(default=True))  # Add 'is_active' field to Group
Group.add_to_class(
    "unique_name", CharField(max_length=100, null=True, unique=True, db_collation="case_insensitive")
)  # Add 'unique_name' field
