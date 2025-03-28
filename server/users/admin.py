from django.contrib.admin import register, ModelAdmin

from users.models import User


@register(User)
class UserAdmin(ModelAdmin):
    list_display = ("id", "first_name", "driver_number")
