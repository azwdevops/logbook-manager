from collections import defaultdict
from datetime import timedelta

from django.utils.timezone import now, localtime
from django.db.models import Sum, F, ExpressionWrapper, DurationField

from rest_framework.serializers import ModelSerializer

from logbook.models import Carrier, TripDetail, TripItem, StopRest, TripDay, Truck


class CarrierViewSerializer(ModelSerializer):
    class Meta:
        model = Carrier
        fields = ("id", "name")

    def to_representation(self, carrier):
        data = super().to_representation(carrier)
        data["email"] = carrier.admin.email

        return data


class TripDetailSerializer(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = ("current_location", "pickup_location", "dropoff_location", "cycle_used", "carrier")


class TripDaySerializer(ModelSerializer):
    class Meta:
        model = TripDay
        fields = ("trip_detail", "trip_date", "is_current")


class TripDayViewSerializer(ModelSerializer):
    class Meta:
        model = TripDay
        fields = ("id", "trip_date")


class TripDetailViewSerializer(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = ("id", "trip_start_date")

    def to_representation(self, trip_detail):
        data = super().to_representation(trip_detail)
        data["pickup_location_name"] = trip_detail.pickup_location["name"]
        data["dropoff_location_name"] = trip_detail.dropoff_location["name"]
        # we add 1 since the days should be inclusive of both start and end
        data["logbook_count"] = (
            (trip_detail.trip_end_date - trip_detail.trip_start_date).days + 1 if trip_detail.trip_end_date else 1
        )
        data["driver_name"] = (
            f"{trip_detail.driver.first_name} {trip_detail.driver.last_name}" if trip_detail.driver else ""
        )
        data["truck_number"] = (
            f"{trip_detail.truck.truck_number} {trip_detail.truck.trailer_number}" if trip_detail.truck else ""
        )

        return data


class MultipleTripDetailViewSerializer(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = ("id", "trip_start_date")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["pickup_location_name"] = instance.pickup_location["name"]
        data["dropoff_location_name"] = instance.dropoff_location["name"]
        # we add 1 since the days should be inclusive of both start and end
        data["logbook_count"] = (
            (instance.trip_end_date - instance.trip_start_date).days + 1 if instance.trip_end_date else 1
        )

        return data


class SingleTripDetailViewSerializer(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = ("id", "trip_start_date", "current_location", "pickup_location", "dropoff_location")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        active_trip_days = instance.tripday_set.filter(is_current=True)

        if active_trip_days.exists():
            current_trip_day = active_trip_days[0]
            data["current_trip_day"] = TripDayViewSerializer(current_trip_day).data
            active_trip_items = current_trip_day.tripitem_set.filter(is_current=True)
            if active_trip_items.exists():
                data["current_trip_item"] = TripItemViewSerializer(active_trip_items[0]).data
            else:
                data["current_trip_item"] = None
        else:
            data["current_trip_item"] = None

        return data


class TripItemSerializer(ModelSerializer):
    class Meta:
        model = TripItem
        fields = ("trip_day", "item_type", "remarks", "is_current", "start_time")

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        data["is_current"] = True

        return data


class TripItemViewSerializer(ModelSerializer):
    class Meta:
        model = TripItem
        fields = ("id", "start_time", "end_time")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["trip_item_name"] = instance.get_item_type_display()

        return data


class StopRestSerializer(ModelSerializer):
    class Meta:
        model = StopRest
        fields = ("trip_day", "stop_location", "stop_type", "start_time", "end_time")


class TripDayLogbookView(ModelSerializer):
    class Meta:
        model = TripDay
        fields = ("id", "trip_date", "total_miles_driving_today", "mileage_covered_today")

    def to_representation(self, trip_day):
        data = super().to_representation(trip_day)
        data["driver_number"] = trip_day.trip_detail.driver.driver_number
        data["driver_initials"] = trip_day.trip_detail.driver.driver_initials
        data["pickup_location_name"] = trip_day.trip_detail.pickup_location["name"]
        data["dropoff_location_name"] = trip_day.trip_detail.dropoff_location["name"]
        data["trip_items"] = self.get_trip_day_items(trip_day.id)
        data["on_duty_hours"] = self.get_on_duty_hours_today(trip_day)
        data["on_duty_hours_last_seven_days"] = self.get_on_duty_hours_last_number_of_days(
            self.context.get("request_user"), 7
        )
        data["on_duty_hours_last_five_days"] = self.get_on_duty_hours_last_number_of_days(
            self.context.get("request_user"), 5
        )
        data["on_duty_hours_last_eight_days"] = self.get_on_duty_hours_last_number_of_days(
            self.context.get("request_user"), 8
        )
        data["truck_trailer_number"] = (
            f"{trip_day.trip_detail.truck.truck_number} {trip_day.trip_detail.truck.trailer_number}"
        )

        return data

    def get_trip_day_items(self, trip_day_id):
        # Define mapping for item_type to numeric row values
        ITEM_TYPE_MAPPING = {
            "Off Duty": 1,
            "Sleeper Berth": 2,
            "Driving": 3,
            "On Duty (not driving)": 4,
        }

        # Get all trip items for the given TripDay, sorted by start_time
        trip_items = TripItem.objects.filter(trip_day__id=trip_day_id).order_by("start_time")

        # Initialize grouped data structure
        grouped_items = defaultdict(list)

        # Convert trip items to the required format
        for i, item in enumerate(trip_items):
            local_start_time = localtime(item.start_time)  # Convert to Django's active timezone
            local_end_time = localtime(item.end_time) if item.end_time else None  # Handle null end_time

            start_hour = local_start_time.hour
            end_hour = local_end_time.hour if local_end_time else None  # Keep None if end_time is null

            # Determine nextRow based on the next trip item
            nextRow = (
                ITEM_TYPE_MAPPING.get(trip_items[i + 1].get_item_type_display(), None)
                if i + 1 < len(trip_items)
                else None
            )

            # Append formatted item to the respective group
            grouped_items[ITEM_TYPE_MAPPING[item.get_item_type_display()]].append(
                {"start_time": start_hour, "end_time": end_hour, "nextRow": nextRow}
            )

        # Convert defaultdict to a regular dictionary and sort by keys
        sorted_grouped_items = {k: grouped_items[k] for k in sorted(grouped_items)}

        return sorted_grouped_items

    def get_on_duty_hours_today(self, trip_day):
        # Filter only the relevant trip items
        on_duty_items = trip_day.tripitem_set.filter(item_type__in=["driving", "on-duty-not-driving"])

        # Annotate and sum the duration (end_time - start_time)
        total_duration = on_duty_items.aggregate(
            total=Sum(ExpressionWrapper(F("end_time") - F("start_time"), output_field=DurationField()))
        )["total"]

        # Convert duration to hours if not None, otherwise return 0
        return round(total_duration.total_seconds() / 3600, 2) if total_duration else 0

    def get_on_duty_hours_last_number_of_days(self, request_user, number_of_days):
        # Define the time range (last n days)
        n_days_ago = now() - timedelta(days=number_of_days)

        # Filter only the relevant trip items for the past week
        on_duty_items = TripItem.objects.filter(
            trip_day__trip_detail__driver=request_user,
            item_type__in=["driving", "on-duty-not-driving"],
            end_time__gte=n_days_ago,  # Ensures all included items have a valid end_time)
        )

        # Annotate and sum the duration (end_time - start_time)
        total_duration = on_duty_items.aggregate(
            total=Sum(ExpressionWrapper(F("end_time") - F("start_time"), output_field=DurationField()))
        )["total"]

        # Convert duration to hours if not None, otherwise return 0
        return round(total_duration.total_seconds() / 3600, 2) if total_duration else 0


class TripRouteViewSerializer(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = ("id",)

    def to_representation(self, trip_detail):
        stop_rests = StopRest.objects.filter(trip_day__trip_detail=trip_detail).order_by("start_time")
        data = super().to_representation(trip_detail)
        data["trip_stops"] = stop_rests.values("start_time", "stop_location")
        data["middle_index"] = stop_rests.count() // 2
        return data


class TripSummaryViewSerializer(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = (
            "id",
            "cycle_used",
        )

    def to_representation(self, trip_detail):
        data = super().to_representation(trip_detail)
        data["starting_location_name"] = trip_detail.current_location["name"]
        data["pickup_location_name"] = trip_detail.pickup_location["name"]
        data["dropoff_location_name"] = trip_detail.dropoff_location["name"]
        data["trip_mileage"] = trip_detail.tripday_set.aggregate(mileage_sum=Sum("mileage_covered_today"))[
            "mileage_sum"
        ]
        data["trip_days_count"] = trip_detail.tripday_set.count()
        data["stops"] = (
            StopRest.objects.filter(trip_day__trip_detail=trip_detail)
            .order_by("start_time")
            .values("id", "stop_location", "start_time", "end_time", "stop_type")
        )

        return data


class TruckSerializer(ModelSerializer):
    class Meta:
        model = Truck
        fields = ("truck_number", "trailer_number", "carrier")


class TruckViewSerializer(ModelSerializer):
    class Meta:
        model = Truck
        fields = ("id", "truck_number", "trailer_number")
