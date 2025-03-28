from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.UserSignup.as_view(), name="signup"),
    path("login/", views.UserLogin.as_view(), name="login"),
    path("logout/", views.UserLogout.as_view(), name="logout"),
    path("get-user/", views.UserView.as_view(), name="user"),
]
