from django.db.models import (
    Model,
    JSONField,
    CharField,
    ForeignKey,
    PROTECT,
    DateTimeField,
    DateField,
    BooleanField,
    FloatField,
)

from logbook.choices import trip_item_types
from users.models import User


class TripDetail(Model):
    current_location = JSONField()
    pickup_location = JSONField()
    dropoff_location = JSONField()
    cycle_used = CharField(max_length=100)
    trip_start_date = DateField()
    trip_end_date = DateField(null=True)
    is_current = BooleanField(default=False)
    is_done = BooleanField(default=False)
    driver = ForeignKey(User, on_delete=PROTECT, null=True, blank=True)


class TripDay(Model):
    trip_detail = ForeignKey(TripDetail, on_delete=PROTECT, null=True, blank=True)
    trip_date = DateField()
    # mileage covered today by the logged in driver
    total_miles_driving_today = FloatField(default=0)
    # overall miles covered today including those from co-drivers
    mileage_covered_today = FloatField(default=0)
    is_current = BooleanField(default=False)
    is_done = BooleanField(default=False)
    truck_trailer_number = CharField(max_length=255, null=True)

    class Meta:
        unique_together = ("trip_detail", "trip_date")

    def to_str(self):
        return f"{self.trip_date}"


class StopRest(Model):
    trip_day = ForeignKey(TripDay, on_delete=PROTECT, null=True, blank=True)
    stop_location = JSONField()
    stop_type = CharField(max_length=255)
    start_time = DateTimeField(null=True)
    end_time = DateTimeField(null=True)


class TripItem(Model):
    trip_day = ForeignKey(TripDay, on_delete=PROTECT, null=True, blank=True)
    item_type = CharField(max_length=100, choices=trip_item_types)
    start_time = DateTimeField()
    end_time = DateTimeField(null=True)
    remarks = CharField(max_length=255, null=True)
    is_current = BooleanField(default=False)
