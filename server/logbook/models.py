from django.db.models import (
    Model,
    JSONField,
    CharField,
    ForeignKey,
    PROTECT,
    CASCADE,
    DateTimeField,
    DateField,
    BooleanField,
    FloatField,
)

from logbook.choices import logbook_item_types
from users.models import User


# Carrier model: Represents a carrier company
class Carrier(Model):
    # Name of the carrier, unique and case-insensitive
    name = CharField(max_length=100, unique=True, db_collation="case_insensitive")
    # Admin of the carrier, can be null, related to User model
    admin = ForeignKey(User, on_delete=CASCADE, null=True, blank=True, related_name="carrier_admin")

    def __str__(self):
        return self.name


# Truck model: Represents a truck and its associated information
class Truck(Model):
    # Truck's unique number, case-insensitive
    truck_number = CharField(max_length=100, unique=True, db_collation="case_insensitive")
    # Trailer's unique number, case-insensitive
    trailer_number = CharField(max_length=100, unique=True, db_collation="case_insensitive")
    # Carrier associated with this truck, cannot delete carrier if truck is in use
    carrier = ForeignKey(Carrier, on_delete=PROTECT, null=True, blank=True)
    # Indicates if the truck is currently assigned
    truck_assigned = BooleanField(default=False)


# TripDetail model: Contains details about a specific trip for a carrier
class TripDetail(Model):
    # Carrier associated with this trip detail, cannot delete carrier if trip is in progress
    carrier = ForeignKey(Carrier, on_delete=PROTECT, null=True, blank=True)
    # Current location during the trip, stored as JSON (e.g., lat, long)
    current_location = JSONField()
    # Pickup location during the trip, stored as JSON (e.g., lat, long)
    pickup_location = JSONField()
    # Dropoff location during the trip, stored as JSON (e.g., lat, long)
    dropoff_location = JSONField()
    # Cycle used for this trip
    cycle_used = CharField(max_length=100)
    # Start date of the trip, can be null
    trip_start_date = DateField(null=True)
    # End date of the trip, can be null
    trip_end_date = DateField(null=True, blank=True)
    # Boolean to mark if the trip is currently active
    is_current = BooleanField(default=False)
    # Boolean to mark if the trip is completed
    is_done = BooleanField(default=False)
    # Driver associated with this trip, can be null
    driver = ForeignKey(User, on_delete=PROTECT, null=True, blank=True)
    # Truck assigned to this trip, can be null
    truck = ForeignKey(Truck, on_delete=PROTECT, null=True, blank=True)


class DriverLogbook(Model):
    logbook_date = DateField()
    # Mileage covered today by the logged-in driver
    total_miles_driving_today = FloatField(default=0)
    # Overall mileage covered today, including co-drivers
    mileage_covered_today = FloatField(default=0)
    driver = ForeignKey(User, on_delete=PROTECT, null=True, blank=True)
    truck = ForeignKey(Truck, on_delete=PROTECT, null=True, blank=True)

    class Meta:
        # Ensures that there are no duplicate entries for the same trip on the same day
        unique_together = ("driver", "logbook_date")

    # String representation of the driver logbook, returns the date and driver number
    def to_str(self):
        return f"{self.logbook_date} {self.driver.driver_number}"


# StopRest model: Represents a stop or rest period during the trip
class StopRest(Model):
    trip_detail = ForeignKey(TripDetail, on_delete=PROTECT, null=True, blank=True)
    # Location of the stop/rest, stored as JSON (e.g., lat, long)
    stop_location = JSONField()
    # Type of stop (e.g., fuel, rest)
    stop_type = CharField(max_length=255)
    # Start time of the stop
    start_time = DateTimeField(null=True)
    # End time of the stop
    end_time = DateTimeField(null=True, blank=True)


class LogbookItem(Model):
    driver_logbook = ForeignKey(DriverLogbook, on_delete=PROTECT, null=True, blank=True)
    # Type of the trip item (e.g., stop, loading, unloading), choices from the trip_item_types list
    item_type = CharField(max_length=100, choices=logbook_item_types)
    # Start time of the item/activity
    start_time = DateTimeField()
    # End time of the item/activity, can be null
    end_time = DateTimeField(null=True, blank=True)
    # Additional remarks for the trip item
    remarks = CharField(max_length=255, null=True)
    # Boolean to mark if this item is currently active
    is_current = BooleanField(default=False)
