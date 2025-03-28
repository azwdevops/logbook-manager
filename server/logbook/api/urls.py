from django.urls import path

from logbook.api import views

urlpatterns = [
    path("add-trip/", views.add_trip, name="add_trip"),
    path("get-trips/", views.get_trips, name="get_trips"),
    path("record-stop/", views.record_stop, name="record_stop"),
    path("change-trip-status/", views.change_trip_status, name="change_trip_status"),
    path("end-trip/", views.end_trip, name="end_trip"),
    path("get-logbook-detail/<int:tripId>/", views.get_logbook_detail, name="get_logbook_detail"),
]
