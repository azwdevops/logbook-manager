from django.utils.timezone import now

from rest_framework.serializers import ModelSerializer

from logbook.models import TripDetail, TripItem, StopRest, TripDay


class TripDetailSerializer(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = (
            "current_location",
            "pickup_location",
            "dropoff_location",
            "cycle_used",
            "trip_start_date",
            "driver",
            "is_current",
        )


class TripDaySerializer(ModelSerializer):
    class Meta:
        model = TripDay
        fields = ("trip_detail", "trip_date", "is_current")


class TripDayViewSerializer(ModelSerializer):
    class Meta:
        model = TripDay
        fields = ("id", "trip_date")


class MultipleTripDetailViewSerializer(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = ("id", "trip_start_date")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["pickup_location_name"] = instance.pickup_location["name"]
        data["dropoff_location_name"] = instance.dropoff_location["name"]
        data["logbook_count"] = (
            (instance.trip_end_date - instance.trip_start_date).days if instance.trip_end_date else 1
        )

        return data


class SingleTripDetailViewSerializer(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = ("id", "trip_start_date")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        active_trip_days = instance.tripday_set.filter(is_current=True)
        data["pickup_location_name"] = instance.pickup_location["name"]
        data["dropoff_location_name"] = instance.dropoff_location["name"]

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
        fields = ("id", "start_time")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["trip_item_name"] = instance.get_item_type_display()

        return data


class StopRestSerializer(ModelSerializer):
    class Meta:
        model = StopRest
        fields = ("trip_detail", "stop_location", "stop_type", "start_time", "end_time")


class TripDetailLogbookView(ModelSerializer):
    class Meta:
        model = TripDetail
        fields = ("id", "trip_date")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["driver_number"] = instance.driver.driver_number
        data["driver_initials"] = instance.driver.driver_initials
        data["pickup_location_name"] = instance.pickup_location["name"]
        data["dropoff_location_name"] = instance.dropoff_location["name"]

        return data
