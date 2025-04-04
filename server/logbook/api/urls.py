from django.urls import path
from logbook.api import views


urlpatterns = [
    # Carrier management
    path("maintain-carriers/", views.MaintainCarriers.as_view(), name="maintain_carriers"),  # Manage carriers
    # Truck management
    path("maintain-trucks/", views.MaintainTrucks.as_view(), name="maintain_trucks"),  # Manage trucks
    path("add-trip/", views.add_trip, name="add_trip"),  # Create a new trip
    path("carrier-get-trips/", views.carrier_get_trips, name="carrier_get_trips"),  # Retrieve trips for a carrier
    path("assign-trip-driver/", views.assign_trip_driver, name="assign_trip_driver"),  # Assign a driver to a trip
    path("get-trip-summary/<int:tripId>/", views.get_trip_summary, name="get_trip_summary"),  # Fetch trip summary
    path("get-current-trip/", views.get_current_trip, name="get_current_trip"),  # Fetch the current active trip
    path("change-status/", views.change_status, name="change_status"),  # Modify driver status
    path("record-stop/", views.record_stop, name="record_stop"),  # Record a stop during the trip
    path("get-trip-route/<int:tripId>/", views.get_trip_route, name="get_trip_route"),  # Fetch trip route details
    path("driver-get-trips/", views.driver_get_trips, name="driver_get_trips"),  # Retrieve driver trips
    path("get-driver-logbooks/", views.get_driver_logbooks, name="get_driver_logbooks"),
    path(
        "get-logbook-detail/<int:logbookId>/", views.get_logbook_detail, name="get_logbook_detail"
    ),  # Retrieve details for a specific logbook entry
    path("driver-end-trip/", views.driver_end_trip, name="driver_end_trip"),  # Mark a trip as completed
    path("record-mileage-covered-today/", views.record_mileage_covered_today, name="record_mileage_covered_today"),
]
