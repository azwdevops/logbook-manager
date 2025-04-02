from django.urls import path
from . import views  # Import views from the current package

# URL routing for user-related actions
urlpatterns = [
    path("login/", views.UserLogin.as_view(), name="login"),  # Route for user login, handled by UserLogin view
    path("logout/", views.UserLogout.as_view(), name="logout"),  # Route for user logout, handled by UserLogout view
    path(
        "maintain-user/", views.MaintainUser.as_view(), name="maintain_user"
    ),  # Route to maintain user data, handled by MaintainUser view
    path(
        "maintain-drivers/", views.MaintainDrivers.as_view(), name="maintain_drivers"
    ),  # Route to manage driver data, handled by MaintainDrivers view
    path(
        "change-password/", views.change_password, name="change_password"
    ),  # Route to change user password, handled by change_password view function
    path(
        "get-available-carrier-drivers/", views.get_available_carrier_drivers, name="get_available_carrier_drivers"
    ),  # Route to fetch available drivers for a carrier, handled by get_available_carrier_drivers view function
]
