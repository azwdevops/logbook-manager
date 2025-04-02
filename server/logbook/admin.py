from django.contrib.admin import register, ModelAdmin

# Importing the necessary models from logbook to register them with the Django admin site
from logbook.models import TripDetail, TripItem, TripDay, StopRest, Carrier, Truck


@register(TripDetail)  # Registering the TripDetail model in the Django admin
class TripDetailAdmin(ModelAdmin):
    """
    Customizes the TripDetail model's appearance and behavior in the Django admin.
    """

    # Fields displayed in the list view of the admin interface
    list_display = (
        "id",  # ID of the trip detail
        "trip_start_date",  # Start date of the trip
        "trip_end_date",  # End date of the trip
        "driver",  # Driver associated with the trip
        "truck",  # Truck used for the trip
        "pickup_location",  # Pickup location for the trip
        "is_done",  # Whether the trip is completed or not
        "is_current",  # Whether the trip is the current active trip
    )

    # Fields that are editable directly from the list view
    list_editable = ("trip_start_date", "is_done", "is_current", "driver", "truck")


@register(TripDay)  # Registering the TripDay model in the Django admin
class TripDayAdmin(ModelAdmin):
    """
    Customizes the TripDay model's appearance and behavior in the Django admin.
    """

    # Fields displayed in the list view of the admin interface
    list_display = ("trip_date", "is_current")  # Displaying the trip date and whether the day is current


@register(TripItem)  # Registering the TripItem model in the Django admin
class TripItemAdmin(ModelAdmin):
    """
    Customizes the TripItem model's appearance and behavior in the Django admin.
    """

    # Fields displayed in the list view of the admin interface
    list_display = (
        "item_type",
        "start_time",
        "end_time",
        "is_current",
    )  # Displaying the item type, start and end times, and current status

    # Fields that are editable directly from the list view
    list_editable = ("start_time", "end_time")  # Allowing the start and end times to be edited directly


@register(StopRest)  # Registering the StopRest model in the Django admin
class StopRestAdmin(ModelAdmin):
    """
    Customizes the StopRest model's appearance and behavior in the Django admin.
    """

    # Fields displayed in the list view of the admin interface
    list_display = (
        "trip_day",
        "stop_type",
        "start_time",
        "stop_location",
    )  # Displaying the trip day, stop type, start time, and stop location


@register(Carrier)  # Registering the Carrier model in the Django admin
class CarrierAdmin(ModelAdmin):
    """
    Customizes the Carrier model's appearance and behavior in the Django admin.
    """

    # Fields displayed in the list view of the admin interface
    list_display = ("id", "name")  # Displaying the ID and name of the carrier


@register(Truck)  # Registering the Truck model in the Django admin
class TruckAdmin(ModelAdmin):
    """
    Customizes the Truck model's appearance and behavior in the Django admin.
    """

    # Fields displayed in the list view of the admin interface
    list_display = (
        "id",
        "truck_number",
        "trailer_number",
        "truck_assigned",
        "carrier",
    )  # Displaying the ID, truck number, and trailer number
    list_editable = ("truck_assigned",)  # the fields that are editable on the admin
