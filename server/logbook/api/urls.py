from django.urls import path

from logbook.api import views

urlpatterns = [
    path("add-trip/", views.add_trip, name="add_trip"),
    path("get-trips/", views.get_trips, name="get_trips"),
    path("get-current-trip/", views.get_current_trip, name="get_current_trip"),
    path("record-stop/", views.record_stop, name="record_stop"),
    path("change-trip-status/", views.change_trip_status, name="change_trip_status"),
    path("end-trip/", views.end_trip, name="end_trip"),
    path("get-logbook-detail/<int:tripId>/<int:logbookIndex>/", views.get_logbook_detail, name="get_logbook_detail"),
    path("close-trip-day/", views.close_trip_day, name="close_trip_day"),
    path("start-trip-day/", views.start_trip_day, name="start_trip_day"),
    path("get-trip-route/<int:tripId>/", views.get_trip_route, name="get_trip_route"),
    path("get-trip-summary/<int:tripId>/", views.get_trip_summary, name="get_trip_summary"),
]
