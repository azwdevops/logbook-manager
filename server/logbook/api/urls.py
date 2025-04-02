from django.urls import path
from logbook.api import views

urlpatterns = [
    # Carrier management
    path("maintain-carriers/", views.MaintainCarriers.as_view(), name="maintain_carriers"),  # Manage carriers
    # Trip management
    path("add-trip/", views.add_trip, name="add_trip"),  # Create a new trip
    path("carrier-get-trips/", views.carrier_get_trips, name="carrier_get_trips"),  # Retrieve trips for a carrier
    path("get-trips/", views.get_trips, name="get_trips"),  # Retrieve all trips
    path("get-current-trip/", views.get_current_trip, name="get_current_trip"),  # Fetch the current active trip
    path("change-trip-status/", views.change_trip_status, name="change_trip_status"),  # Modify trip status
    path("end-trip/", views.end_trip, name="end_trip"),  # Mark a trip as completed
    # Logbook management
    path(
        "get-logbook-detail/<int:tripId>/<int:logbookIndex>/", views.get_logbook_detail, name="get_logbook_detail"
    ),  # Retrieve details for a specific logbook entry
    path("close-trip-day/", views.close_trip_day, name="close_trip_day"),  # Close the current trip day
    path("start-trip-day/", views.start_trip_day, name="start_trip_day"),  # Start a new trip day
    # Route and summary retrieval
    path("get-trip-route/<int:tripId>/", views.get_trip_route, name="get_trip_route"),  # Fetch trip route details
    path("get-trip-summary/<int:tripId>/", views.get_trip_summary, name="get_trip_summary"),  # Fetch trip summary
    # Truck management
    path("maintain-trucks/", views.MaintainTrucks.as_view(), name="maintain_trucks"),  # Manage trucks
    # Trip assignments
    path("assign-trip-driver/", views.assign_trip_driver, name="assign_trip_driver"),  # Assign a driver to a trip
    # Stop recording
    path("record-stop/", views.record_stop, name="record_stop"),  # Record a stop during the trip
]
