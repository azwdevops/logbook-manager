from django.contrib.admin import register, ModelAdmin

from logbook.models import TripDetail, DriverLogbook, LogbookItem, StopRest, Carrier, Truck


@register(Carrier)
class CarrierAdmin(ModelAdmin):
    list_display = ["name"]


@register(Truck)
class TruckAdmin(ModelAdmin):
    list_display = ["truck_number", "trailer_number"]


@register(TripDetail)
class TripDetailAdmin(ModelAdmin):
    list_display = ["carrier", "trip_start_date", "driver", "is_current", "is_done"]
    list_editable = ["is_current", "is_done"]


@register(DriverLogbook)
class DriverLogbookAdmin(ModelAdmin):
    list_display = ["id", "driver", "logbook_date"]
    list_editable = ["logbook_date"]


@register(LogbookItem)
class LogbookItemAdmin(ModelAdmin):
    list_display = ["id", "driver_logbook", "item_type", "start_time", "end_time", "is_current"]
    list_editable = ["start_time", "end_time", "is_current"]


@register(StopRest)
class StopRestAdmin(ModelAdmin):
    list_display = ["trip_detail", "stop_type"]
