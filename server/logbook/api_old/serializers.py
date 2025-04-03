from collections import defaultdict
from datetime import timedelta

from django.utils.timezone import now, localtime
from django.db.models import Sum, F, ExpressionWrapper, DurationField

from rest_framework.serializers import ModelSerializer

from logbook.models import Carrier, TripDetail, TripItem, StopRest, TripDay, Truck


class CarrierViewSerializer(ModelSerializer):
    """
    Serializer for the Carrier model.

    This serializer includes the 'id' and 'name' fields from the Carrier model
    and adds the admin's email in the representation.
    """

    class Meta:
        model = Carrier  # Specifies the model to be serialized
        fields = ("id", "name")  # Defines the fields to be included in the serialization

    def to_representation(self, carrier):
        """
        Customizes the serialized representation of the Carrier instance.

        Args:
            carrier: The Carrier instance being serialized.

        Returns:
            dict: The serialized data with an additional 'email' field.
        """
        data = super().to_representation(carrier)  # Get the default serialized data
        data["email"] = carrier.admin.email  # Add the admin's email to the serialized output

        return data  # Return the modified data dictionary


class TripDetailSerializer(ModelSerializer):
    """
    Serializer for the TripDetail model.

    This serializer includes fields related to trip details such as locations,
    cycle usage, and the associated carrier.
    """

    class Meta:
        model = TripDetail  # Specifies the model to be serialized
        # Define the fields to be included in the serialization
        fields = ("current_location", "pickup_location", "dropoff_location", "cycle_used", "carrier")


class TripDaySerializer(ModelSerializer):
    """
    Serializer for the TripDay model.

    This serializer includes fields related to each day's trip details,
    including the trip reference, date, and whether it is the current trip day.
    """

    class Meta:
        model = TripDay  # Specifies the model to be serialized
        fields = ("trip_detail", "trip_date", "is_current")
        # Defines the fields to be included in the serialization


class TripDayViewSerializer(ModelSerializer):
    """
    Serializer for the TripDay model, focusing on view representation.

    This serializer includes basic fields for the TripDay, such as the trip ID and the trip date.
    """

    class Meta:
        model = TripDay  # Specifies the model to be serialized
        fields = ("id", "trip_date")  # Defines the fields to be included in the serialization


class TripDetailViewSerializer(ModelSerializer):
    """
    Serializer for the TripDetail model, customized for detailed trip view.

    This serializer includes basic fields for trip details along with additional calculated information
    such as pickup/dropoff location names, logbook count, driver and truck details.
    """

    class Meta:
        model = TripDetail  # Specifies the model to be serialized
        fields = ("id", "trip_start_date", "is_done")  # Defines the basic fields to be included in the serialization

    def to_representation(self, trip_detail):
        """
        Customizes the serialized representation of the TripDetail instance.

        Args:
            trip_detail: The TripDetail instance being serialized.

        Returns:
            dict: The serialized data with additional fields such as location names,
                  logbook count, driver name, and truck details.
        """
        data = super().to_representation(trip_detail)  # Get the default serialized data

        # Add the name of the pickup location
        data["pickup_location_name"] = trip_detail.pickup_location["name"]

        # Add the name of the dropoff location
        data["dropoff_location_name"] = trip_detail.dropoff_location["name"]

        # Calculate the logbook count (days inclusive of both start and end dates)
        data["logbook_count"] = (
            (trip_detail.trip_end_date - trip_detail.trip_start_date).days + 1 if trip_detail.trip_end_date else 1
        )

        # Add the driver's full name, or an empty string if no driver exists
        data["driver_name"] = (
            f"{trip_detail.driver.first_name} {trip_detail.driver.last_name}" if trip_detail.driver else ""
        )

        # Add truck details, combining truck number and trailer number, or an empty string if no truck exists
        data["truck_number"] = (
            f"{trip_detail.truck.truck_number} {trip_detail.truck.trailer_number}" if trip_detail.truck else ""
        )

        return data  # Return the modified data dictionary


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

        # Calculate the logbook count (days inclusive of both start and end dates)
        data["logbook_count"] = (
            (instance.trip_end_date - instance.trip_start_date).days + 1 if instance.trip_end_date else 1
        )

        return data  # Return the modified data dictionary


class SingleTripDetailViewSerializer(ModelSerializer):
    """
    Serializer for the TripDetail model, customized for handling a single trip detail view.

    This serializer includes basic fields for trip details along with dynamic information
    about the current trip day and trip item.
    """

    class Meta:
        model = TripDetail  # Specifies the model to be serialized
        fields = ("id", "trip_start_date", "current_location", "pickup_location", "dropoff_location")
        # Defines the fields to be included in the serialization

    def to_representation(self, instance):
        """
        Customizes the serialized representation of the TripDetail instance.

        Args:
            instance: The TripDetail instance being serialized.

        Returns:
            dict: The serialized data, including details about the current trip day and trip item.
        """
        data = super().to_representation(instance)  # Get the default serialized data

        # Get the active trip days related to the current trip
        active_trip_days = instance.tripday_set.filter(is_current=True)

        # Check if there are active trip days
        if active_trip_days.exists():
            current_trip_day = active_trip_days[0]  # Get the first active trip day
            data["current_trip_day"] = TripDayViewSerializer(current_trip_day).data  # Serialize the current trip day

            # Get the active trip items related to the current trip day
            active_trip_items = current_trip_day.tripitem_set.filter(is_current=True)

            # If there are active trip items, add the serialized data for the first one
            if active_trip_items.exists():
                data["current_trip_item"] = TripItemViewSerializer(active_trip_items[0]).data
            else:
                data["current_trip_item"] = None  # If no active trip items, set to None
        else:
            data["current_trip_item"] = None  # If no active trip days, set the trip item to None

        return data  # Return the modified data dictionary


class TripItemSerializer(ModelSerializer):
    """
    Serializer for the TripItem model.

    This serializer includes fields related to a trip item, such as trip day, item type,
    remarks, and the start time. It also ensures the 'is_current' field is set to True.
    """

    class Meta:
        model = TripItem  # Specifies the model to be serialized
        fields = ("trip_day", "item_type", "remarks", "is_current", "start_time")
        # Defines the fields to be included in the serialization

    def to_internal_value(self, data):
        """
        Customizes the conversion of input data into internal values.

        Args:
            data: The input data to be converted into internal values.

        Returns:
            dict: The modified data, with the 'is_current' field set to True.
        """
        data = super().to_internal_value(data)  # Get the default internal values

        # Ensure that 'is_current' is set to True when saving a trip item
        data["is_current"] = True

        return data  # Return the modified data dictionary


class TripItemViewSerializer(ModelSerializer):
    """
    Serializer for viewing TripItem details.

    This serializer includes essential fields such as start and end times and also
    adds a human-readable representation of the item type.
    """

    class Meta:
        model = TripItem  # Specifies the model to be serialized
        fields = ("id", "start_time", "end_time")
        # Defines the fields to be included in the serialization

    def to_representation(self, instance):
        """
        Customizes the serialized representation of the TripItem instance.

        Args:
            instance: The TripItem instance being serialized.

        Returns:
            dict: The serialized data, including a human-readable trip item name.
        """
        data = super().to_representation(instance)  # Get the default serialized data

        # Add a human-readable name for the trip item type using Django's get_FOO_display() method
        data["trip_item_name"] = instance.get_item_type_display()

        return data  # Return the modified data dictionary


class StopRestSerializer(ModelSerializer):
    """
    Serializer for the StopRest model.

    This serializer handles the serialization of stop/rest details associated with a trip day,
    including the stop location, type, and time details.
    """

    class Meta:
        model = StopRest  # Specifies the model to be serialized
        fields = ("trip_day", "stop_location", "stop_type", "start_time", "end_time")
        # Defines the fields to be included in the serialization


class TripDayLogbookView(ModelSerializer):
    """
    Serializer for viewing trip day logbook details.

    This serializer provides details about a trip day, including mileage, driver details,
    trip items, duty hours, and truck information.
    """

    class Meta:
        model = TripDay  # Specifies the model being serialized
        fields = ("id", "trip_date", "total_miles_driving_today", "mileage_covered_today")

    def to_representation(self, trip_day):
        """
        Customizes the serialized representation of a TripDay instance.

        Args:
            trip_day (TripDay): The TripDay instance being serialized.

        Returns:
            dict: The serialized data, including driver details, trip details, and duty hours.
        """
        data = super().to_representation(trip_day)

        # Driver details
        data["driver_number"] = trip_day.trip_detail.driver.driver_number
        data["driver_initials"] = trip_day.trip_detail.driver.driver_initials

        # Carrer

        # Location details
        data["pickup_location_name"] = trip_day.trip_detail.pickup_location["name"]
        data["dropoff_location_name"] = trip_day.trip_detail.dropoff_location["name"]

        # Trip items
        data["trip_items"] = self.get_trip_day_items(trip_day.id)

        # On-duty hours calculations
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

        # Truck and trailer number
        data["truck_trailer_number"] = (
            f"{trip_day.trip_detail.truck.truck_number} {trip_day.trip_detail.truck.trailer_number}"
        )

        return data

    def get_trip_day_items(self, trip_day_id):
        """
        Retrieves and groups trip items by their type, sorted by start time.

        Args:
            trip_day_id (int): The ID of the TripDay instance.

        Returns:
            dict: A dictionary where keys are numeric row values representing item types,
                  and values are lists of trip item details.
        """
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
        """
        Calculates total on-duty hours for the given trip day.

        Args:
            trip_day (TripDay): The TripDay instance.

        Returns:
            float: Total on-duty hours for the trip day.
        """
        # Filter only the relevant trip items
        on_duty_items = trip_day.tripitem_set.filter(item_type__in=["driving", "on-duty-not-driving"])

        # Annotate and sum the duration (end_time - start_time)
        total_duration = on_duty_items.aggregate(
            total=Sum(ExpressionWrapper(F("end_time") - F("start_time"), output_field=DurationField()))
        )["total"]

        # Convert duration to hours if not None, otherwise return 0
        return round(total_duration.total_seconds() / 3600, 2) if total_duration else 0

    def get_on_duty_hours_last_number_of_days(self, request_user, number_of_days):
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

        # Filter only the relevant trip items for the past days
        on_duty_items = TripItem.objects.filter(
            trip_day__trip_detail__driver=request_user,
            item_type__in=["driving", "on-duty-not-driving"],
            end_time__gte=n_days_ago,  # Ensures all included items have a valid end_time
        )

        # Annotate and sum the duration (end_time - start_time)
        total_duration = on_duty_items.aggregate(
            total=Sum(ExpressionWrapper(F("end_time") - F("start_time"), output_field=DurationField()))
        )["total"]

        # Convert duration to hours if not None, otherwise return 0
        return round(total_duration.total_seconds() / 3600, 2) if total_duration else 0


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
        stop_rests = StopRest.objects.filter(trip_day__trip_detail=trip_detail).order_by("start_time")

        # Call the parent serializer method
        data = super().to_representation(trip_detail)

        # Add trip stops (only including start_time and stop_location fields)
        data["trip_stops"] = stop_rests.values("start_time", "stop_location")

        # Compute the middle index of stops (useful for UI purposes)
        data["middle_index"] = stop_rests.count() // 2

        return data


class TripSummaryViewSerializer(ModelSerializer):
    """
    Serializer for summarizing a trip's key details.

    This serializer provides an overview of a trip, including location names,
    total mileage, trip duration in days, and stop details.
    """

    class Meta:
        model = TripDetail  # Specifies the model being serialized
        fields = ("id", "cycle_used")  # Only includes the trip ID and cycle used in the serialized output

    def to_representation(self, trip_detail):
        """
        Customizes the serialized representation of a TripDetail instance.

        Args:
            trip_detail (TripDetail): The TripDetail instance being serialized.

        Returns:
            dict: Serialized data including location names, trip mileage, trip duration, and stops.
        """
        # Call the parent serializer method
        data = super().to_representation(trip_detail)

        # Add location details (assuming stored as dictionaries with a "name" field)
        data["starting_location_name"] = trip_detail.current_location["name"]
        data["pickup_location_name"] = trip_detail.pickup_location["name"]
        data["dropoff_location_name"] = trip_detail.dropoff_location["name"]

        # Calculate total mileage covered across all trip days
        data["trip_mileage"] = trip_detail.tripday_set.aggregate(mileage_sum=Sum("mileage_covered_today"))[
            "mileage_sum"
        ]

        # Count the number of days the trip has spanned
        data["trip_days_count"] = trip_detail.tripday_set.count()

        # Fetch and order trip stop details
        data["stops"] = (
            StopRest.objects.filter(trip_day__trip_detail=trip_detail)
            .order_by("start_time")
            .values("id", "stop_location", "start_time", "end_time", "stop_type")
        )

        return data


class TruckSerializer(ModelSerializer):
    """
    Serializer for the Truck model.

    This serializer handles the representation of truck-related details,
    including the truck number, trailer number, and carrier information.
    """

    class Meta:
        model = Truck  # Specifies the model being serialized
        fields = ("truck_number", "trailer_number", "carrier")  # Defines the fields to include in the output


class TruckViewSerializer(ModelSerializer):
    """
    Serializer for viewing Truck model details.

    This serializer provides a read-only representation of a truck,
    including its ID, truck number, and trailer number.
    """

    class Meta:
        model = Truck  # Specifies the model being serialized
        fields = ("id", "truck_number", "trailer_number")  # Defines the fields to include in the output
