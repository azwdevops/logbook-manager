from django.contrib.admin import register, ModelAdmin

from logbook.models import TripDetail, TripItem, TripDay, StopRest, Carrier


@register(TripDetail)
class TripDetailAdmin(ModelAdmin):
    list_display = (
        "id",
        "trip_start_date",
        "trip_end_date",
        "driver",
        "truck",
        "pickup_location",
        "is_done",
        "is_current",
    )
    list_editable = ("trip_start_date", "is_done", "is_current", "driver", "truck")


@register(TripDay)
class TripDayAdmin(ModelAdmin):
    list_display = ("trip_date", "is_current")


@register(TripItem)
class TripItemAdmin(ModelAdmin):
    list_display = ("item_type", "start_time", "end_time", "is_current")
    list_editable = ("start_time", "end_time")


@register(StopRest)
class StopRestAdmin(ModelAdmin):
    list_display = ("trip_day", "stop_type", "start_time", "stop_location")


@register(Carrier)
class CarrierAdmin(ModelAdmin):
    list_display = ("id", "name")
