from django.db.models import AutoField, EmailField, CharField, BooleanField, DateTimeField
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group


# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError("An email is required.")
        if not password:
            raise ValueError("A password is required.")
        email = self.normalize_email(email)
        user = self.model(email=email)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None):
        if not email:
            raise ValueError("An email is required.")
        if not password:
            raise ValueError("A password is required.")
        user = self.create_user(email, password)
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user


class User(AbstractBaseUser, PermissionsMixin):
    id = AutoField(primary_key=True)
    email = EmailField(max_length=100, unique=True, null=True, blank=True, db_collation="case_insensitive")
    first_name = CharField(max_length=50, null=True)
    last_name = CharField(max_length=50, null=True)
    driver_number = CharField(max_length=100, unique=True, db_collation="case_insensitive")
    driver_initials = CharField(max_length=100)
    is_admin = BooleanField(default=False)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
    last_login = DateTimeField(verbose_name="last login", auto_now=True)
    truck_trailer_number = CharField(max_length=255, null=True)

    USERNAME_FIELD = "email"

    objects = UserManager()

    def __str__(self):
        return self.email

    # for permissions, to keep it simple, all admins have all permissions
    def has_perm(self, perm, obj=None):
        return self.is_admin

    # does this user has permission to view app, always yes for simplicity
    def has_module_perms(self, app_label):
        return True
