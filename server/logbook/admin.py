from django.contrib.admin import register, ModelAdmin

from logbook.models import TripDetail, DriverLogbook, LogbookItem, StopRest


@register(TripDetail)
class TripDetailAdmin(ModelAdmin):
    list_display = ["carrier", "trip_start_date", "driver", "is_current", "is_done"]
    list_editable = ["is_current", "is_done"]


@register(DriverLogbook)
class DriverLogbookAdmin(ModelAdmin):
    list_display = ["id", "driver", "logbook_date"]


@register(LogbookItem)
class LogbookItemAdmin(ModelAdmin):
    list_display = ["id", "driver_logbook", "item_type", "start_time", "end_time", "is_current"]
    list_editable = ["start_time", "end_time", "is_current"]


@register(StopRest)
class StopRestAdmin(ModelAdmin):
    list_display = ["trip_detail", "stop_type"]
