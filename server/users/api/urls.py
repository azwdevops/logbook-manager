from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.UserLogin.as_view(), name="login"),
    path("logout/", views.UserLogout.as_view(), name="logout"),
    path("maintain-user/", views.MaintainUser.as_view(), name="maintain_user"),
    path("maintain-drivers/", views.MaintainDrivers.as_view(), name="maintain_drivers"),
    path("change-password/", views.change_password, name="change_password"),
    path("get-available-carrier-drivers/", views.get_available_carrier_drivers, name="get_available_carrier_drivers"),
]
