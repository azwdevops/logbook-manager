from django.contrib.admin import register, ModelAdmin

from logbook.models import TripDetail, TripItem


@register(TripDetail)
class TripDetailAdmin(ModelAdmin):
    list_display = ("trip_start_date", "trip_end_date", "driver", "pickup_location", "is_done", "is_current")
    list_editable = ("is_done", "is_current")


@register(TripItem)
class TripItemAdmin(ModelAdmin):
    list_display = ("item_type", "start_time", "end_time")
