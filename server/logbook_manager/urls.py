from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

# URL configuration for the Django project
urlpatterns = [
    path("admin/", admin.site.urls),  # Admin interface route
    path("api/v1/users/", include("users.api.urls")),  # Include user-related API URLs
    path("api/v1/logbook/", include("logbook.api.urls")),  # Include logbook-related API URLs
]

# Fallback route to serve the 'index.html' template for any other requests such as react frontend links
urlpatterns += [re_path(r"^.*", TemplateView.as_view(template_name="index.html"))]
