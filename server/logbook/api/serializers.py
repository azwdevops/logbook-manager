from collections import defaultdict
from datetime import timedelta

from django.db.models import Sum, F, ExpressionWrapper, DurationField
from django.utils.timezone import now, make_aware, make_naive
from rest_framework.serializers import ModelSerializer

from logbook.models import Carrier, Truck, TripDetail, StopRest, DriverLogbook, LogbookItem


class CarrierViewSerializer(ModelSerializer):
    """
    Serializer for the Carrier model.

    This serializer includes the 'id' and 'name' fields from the Carrier model
    and adds the admin's email to the response.
    """

    class Meta:
        model = Carrier  # This specifies the model, which is Carrier.
        fields = ("id", "name")  # These are the fields that will be included in the serialized output.

    def to_representation(self, carrier):
        """
        Customizes how the Carrier instance is represented when serialized.

        Args:
            carrier: The Carrier instance we are serializing.

        Returns:
            dict: The serialized data, including an extra 'email' field for the admin's email.
        """
        data = super().to_representation(carrier)  # Get the default serialized data first
        data["email"] = carrier.admin.email  # Add the admin's email to the data

        return data  # Return the updated data with the added 'email'


class TruckSerializer(ModelSerializer):
    """
    Serializer for the Truck model.

    This serializer manages how truck details are represented,
    including the truck number, trailer number, and carrier info.
    """

    class Meta:
        model = Truck  # This specifies the model being serialized, which is Truck.
        fields = (
            "truck_number",
            "trailer_number",
            "carrier",
        )  # These are the fields to be included in the serialized data.


class TruckViewSerializer(ModelSerializer):
    """
    Serializer for viewing Truck model details.

    This serializer provides a read-only view of a truck's details,
    including its ID, truck number, and trailer number.
    """

    class Meta:
        model = Truck  # This specifies the model we're serializing, which is Truck.
        fields = ("id", "truck_number", "trailer_number")  # These are the fields to include in the serialized data.


class TripDetailSerializer(ModelSerializer):
    """
    Serializer for the TripDetail model.

    This serializer includes fields related to the trip, such as locations,
    cycle usage, and the associated carrier.
    """

    class Meta:
        model = TripDetail  # Specifies the model being serialized, which is TripDetail.
        # These are the fields to be included in the serialized output.
        fields = ("current_location", "pickup_location", "dropoff_location", "cycle_used", "carrier")


class TripDetailViewSerializer(ModelSerializer):
    """
    Serializer for the TripDetail model, customized for detailed trip view.

    This serializer includes basic fields for trip details along with additional calculated information
    such as pickup/dropoff location names, logbook count, driver and truck details.
    """

    class Meta:
        model = TripDetail  # Specifies the model being serialized, which is TripDetail.
        fields = (
            "id",
            "trip_start_date",
            "is_done",
            "current_location",
            "pickup_location",
            "dropoff_location",
        )  # These are the basic fields that will be included in the serialized output.

    def to_representation(self, trip_detail):
        """
        Customizes the serialized representation of the TripDetail instance.

        Args:
            trip_detail: The TripDetail instance that is being serialized.

        Returns:
            dict: The serialized data with additional fields such as location names,
                  logbook count, driver name, and truck details.
        """
        data = super().to_representation(trip_detail)  # Get the default serialized data from the parent class

        # Add the driver's full name, or an empty string if no driver is assigned
        data["driver_name"] = (
            f"{trip_detail.driver.first_name} {trip_detail.driver.last_name}" if trip_detail.driver else ""
        )

        # Add truck details, combining the truck number and trailer number, or an empty string if no truck is assigned
        data["truck_number"] = (
            f"{trip_detail.truck.truck_number} {trip_detail.truck.trailer_number}" if trip_detail.truck else ""
        )

        return data  # Return the updated data with the additional calculated fields


class TripSummaryViewSerializer(ModelSerializer):
    """
    Serializer for summarizing a trip's key details.

    This serializer provides an overview of a trip, including location names,
    total mileage, trip duration in days, and stop details.
    """

    class Meta:
        model = TripDetail  # Specifies the model being serialized, which is TripDetail.
        fields = ("id", "cycle_used")  # Only includes the trip ID and cycle used in the serialized data.

    def to_representation(self, trip_detail):
        """
        Customizes the serialized representation of a TripDetail instance.

        Args:
            trip_detail (TripDetail): The TripDetail instance being serialized.

        Returns:
            dict: The serialized data including location names, trip mileage, trip duration, and stops.
        """
        # Call the parent class method to get the default serialized data
        data = super().to_representation(trip_detail)

        # Add location details (these are assumed to be dictionaries with a "name" field)
        data["starting_location_name"] = trip_detail.current_location["name"]
        data["pickup_location_name"] = trip_detail.pickup_location["name"]
        data["dropoff_location_name"] = trip_detail.dropoff_location["name"]

        # Fetch and order the trip stop details, such as location, start time, end time, and stop type
        data["stops"] = (
            StopRest.objects.filter(trip_detail=trip_detail)
            .order_by("start_time")  # Sort by start time of the stop
            .values("id", "stop_location", "start_time", "end_time", "stop_type")  # Select relevant fields
        )

        return data  # Return the modified data with additional stop and location details


class SingleTripDetailViewSerializer(ModelSerializer):
    """
    Serializer for the TripDetail model, customized for handling a single trip detail view.

    This serializer includes basic fields for trip details along with dynamic information
    about the current trip.
    """

    class Meta:
        model = TripDetail  # Specifies the model being serialized, which is TripDetail.
        fields = ("id", "trip_start_date", "current_location", "pickup_location", "dropoff_location")
        # These are the fields that will be included in the serialized data for the trip details.


class DriverLogbookViewSerializer(ModelSerializer):
    class Meta:
        model = DriverLogbook  # Specifies the model being serialized, which is DriverLogbook.
        fields = ("id", "logbook_date")  # These are the fields that will be included in the serialized output.


class LogbookItemSerializer(ModelSerializer):
    class Meta:
        model = LogbookItem  # Specifies the model being serialized, which is LogbookItem.
        fields = ("id", "driver_logbook", "item_type", "start_time", "remarks", "is_current")
        # These are the fields that will be included in the serialized output, representing a logbook item.


class LogbookItemViewSerializer(ModelSerializer):
    class Meta:
        model = LogbookItem
        fields = ("id", "start_time")

    def to_representation(self, logbook_item):
        data = super().to_representation(logbook_item)
        data["item_type_name"] = logbook_item.get_item_type_display()

        return data


class StopRestSerializer(ModelSerializer):
    """
    Serializer for the StopRest model.

    This serializer handles the serialization of stop/rest details associated with a trip,
    including the stop location, type, and time details.
    """

    class Meta:
        model = StopRest  # Specifies the model to be serialized
        fields = ("trip_detail", "stop_location", "stop_type", "start_time", "end_time")
        # Defines the fields to be included in the serialization


class TripRouteViewSerializer(ModelSerializer):
    """
    Serializer for viewing a trip's route details.

    This serializer provides a list of trip stops and calculates the middle index
    of the stops for potential use in UI logic or route processing.
    """

    class Meta:
        model = TripDetail  # Specifies the model being serialized
        fields = ("id",)  # Only includes the trip ID in the serialized output

    def to_representation(self, trip_detail):
        """
        Customizes the serialized representation of a TripDetail instance.

        Args:
            trip_detail (TripDetail): The TripDetail instance being serialized.

        Returns:
            dict: Serialized data including trip stops and their middle index.
        """
        # Fetch all stop rests associated with the trip, ordered by start_time
        stop_rests = StopRest.objects.filter(trip_detail=trip_detail).order_by("start_time")

        # Call the parent serializer method
        data = super().to_representation(trip_detail)

        # Add trip stops (only including start_time and stop_location fields)
        data["trip_stops"] = stop_rests.values("start_time", "stop_location")

        # Compute the middle index of stops (useful for UI purposes)
        data["middle_index"] = stop_rests.count() // 2

        return data


class MultipleTripDetailViewSerializer(ModelSerializer):
    """
    Serializer for the TripDetail model, customized for handling multiple trip details view.

    This serializer includes basic fields for trip details along with additional calculated information
    such as pickup/dropoff location names and logbook count.
    """

    class Meta:
        model = TripDetail  # Specifies the model to be serialized
        fields = ("id", "trip_start_date")  # Defines the basic fields to be included in the serialization

    def to_representation(self, instance):
        """
        Customizes the serialized representation of the TripDetail instance.

        Args:
            instance: The TripDetail instance being serialized.

        Returns:
            dict: The serialized data with additional fields such as location names
                  and logbook count.
        """
        data = super().to_representation(instance)  # Get the default serialized data

        # Add the name of the pickup location
        data["pickup_location_name"] = instance.pickup_location["name"]

        # Add the name of the dropoff location
        data["dropoff_location_name"] = instance.dropoff_location["name"]

        return data  # Return the modified data dictionary


class LogbookDetailViewSerializer(ModelSerializer):

    class Meta:
        model = DriverLogbook  # Specifies the model being serialized
        fields = ("id", "logbook_date", "total_miles_driving_today", "mileage_covered_today")

    def to_representation(self, logbook):
        data = super().to_representation(logbook)

        # Driver details
        data["driver_number"] = logbook.driver.driver_number
        data["driver_initials"] = logbook.driver.driver_initials
        data["carrier_name"] = logbook.driver.carrier.name

        # Carrer

        # Trip items
        data["logbook_items"] = self.get_logbook_items(logbook.id)

        # On-duty hours calculations
        data["on_duty_hours"] = self.get_on_duty_hours_today(logbook)
        data["on_duty_hours_last_seven_days"] = self.get_on_duty_hours_last_number_of_days(
            self.context.get("driver_id"), 7
        )
        data["on_duty_hours_last_five_days"] = self.get_on_duty_hours_last_number_of_days(
            self.context.get("driver_id"), 5
        )
        data["on_duty_hours_last_eight_days"] = self.get_on_duty_hours_last_number_of_days(
            self.context.get("driver_id"), 8
        )

        # Truck and trailer number
        data["truck_trailer_number"] = (
            f"{logbook.truck.truck_number} {logbook.truck.trailer_number}" if logbook.truck else "N/A"
        )

        return data

    def get_logbook_items(self, logbookId):
        ITEM_TYPE_MAPPING = {
            "Off Duty": 1,
            "Sleeper Berth": 2,
            "Driving": 3,
            "On Duty (not driving)": 4,
        }

        logbook_items = LogbookItem.objects.filter(driver_logbook__id=logbookId, end_time__isnull=False).order_by(
            "start_time"
        )

        grouped_items = defaultdict(list)
        previous_item = None  # Keep track of the previous item

        for i, item in enumerate(logbook_items):
            start_hour = make_naive(item.start_time).hour
            end_hour = make_naive(item.end_time).hour if item.end_time else None
            item_type = ITEM_TYPE_MAPPING[item.get_item_type_display()]

            # Merge if the previous item was the same type and adjacent
            if previous_item and previous_item["item_type"] == item_type and previous_item["end_time"] == start_hour:
                previous_item["end_time"] = end_hour  # Extend previous entry
            else:
                # New entry
                previous_item = {
                    "start_time": start_hour,
                    "end_time": end_hour,
                    "nextRow": None,  # Will update in the next loop
                    "item_type": item_type,
                }
                grouped_items[item_type].append(previous_item)

        # Flatten all logbook items and sort by start_time
        sorted_items = sorted(
            [entry for sublist in grouped_items.values() for entry in sublist], key=lambda x: x["start_time"]
        )

        # Update nextRow for all except last
        for i in range(len(sorted_items) - 1):
            sorted_items[i]["nextRow"] = sorted_items[i + 1]["item_type"]

        return {k: grouped_items[k] for k in sorted(grouped_items)}

    def get_on_duty_hours_today(self, logbook):
        on_duty_items = logbook.logbookitem_set.filter(item_type__in=["driving", "on-duty-not-driving"])

        # Annotate and sum the duration (end_time - start_time)
        total_duration = on_duty_items.aggregate(
            total=Sum(ExpressionWrapper(F("end_time") - F("start_time"), output_field=DurationField()))
        )["total"]

        # Convert duration to hours if not None, otherwise return 0
        return round(total_duration.total_seconds() / 3600, 2) if total_duration else 0

    def get_on_duty_hours_last_number_of_days(self, driver_id, number_of_days):
        """
        Calculates total on-duty hours for the past given number of days.

        Args:
            request_user (User): The user making the request.
            number_of_days (int): The number of days to calculate on-duty hours.

        Returns:
            float: Total on-duty hours over the specified period.
        """
        # Define the time range (last n days)
        n_days_ago = now() - timedelta(days=number_of_days)

        # Filter only the relevant logbook items for the past days
        on_duty_items = LogbookItem.objects.filter(
            driver_logbook__driver__id=driver_id,
            item_type__in=["driving", "on-duty-not-driving"],
            end_time__gte=n_days_ago,  # Ensures all included items have a valid end_time
        )

        # Annotate and sum the duration (end_time - start_time)
        total_duration = on_duty_items.aggregate(
            total=Sum(ExpressionWrapper(F("end_time") - F("start_time"), output_field=DurationField()))
        )["total"]

        # Convert duration to hours if not None, otherwise return 0
        return round(total_duration.total_seconds() / 3600, 2) if total_duration else 0
