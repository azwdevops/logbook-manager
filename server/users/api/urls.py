from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.UserSignup.as_view(), name="signup"),
    path("login/", views.UserLogin.as_view(), name="login"),
    path("logout/", views.UserLogout.as_view(), name="logout"),
    path("maintain-user/", views.MaintainUser.as_view(), name="maintain_user"),
    path("change-password/", views.change_password, name="change_password"),
]
