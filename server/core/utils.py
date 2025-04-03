from django.utils.timezone import now, make_aware
from datetime import datetime, timedelta
from django.db import transaction

from logbook.models import DriverLogbook, LogbookItem


def get_object_or_none(model_name, **kwargs):
    """
    Attempts to retrieve an object from the given model based on the provided filter criteria.

    Args:
        model_name: The Django model class to query.
        **kwargs: Filter conditions for the query.

    Returns:
        The retrieved object if found, otherwise None.
    """
    try:
        obj = model_name.objects.get(**kwargs)  # Attempt to get the object matching the given filters
        return obj  # Return the retrieved object if found
    except model_name.DoesNotExist:  # Handle the case where no matching object exists
        return None  # Return None if the object does not exist


def update_logbook_item_over_multiple_days(request):
    """Updates the logbook item, handling multi-day spans properly."""
    logbook_item_id = request.data.get("currentLogbookItemId")
    if not logbook_item_id:
        return  # No logbook item to update

    logbook_item = LogbookItem.objects.get(id=logbook_item_id)
    end_time = now()  # Assume current time as end time

    if logbook_item.start_time.date() == end_time.date():
        # Simple case: Same-day logbook item
        close_logbook_item(logbook_item, end_time)
    else:
        # Handle multi-day logbook item
        handle_multi_day_logbook_item(logbook_item, end_time)


def close_logbook_item(logbook_item, end_time):
    """Closes a logbook item by setting its end_time and marking it inactive."""
    logbook_item.end_time = end_time
    logbook_item.is_current = False
    logbook_item.save()


def handle_multi_day_logbook_item(logbook_item, end_time):
    """Handles cases where a logbook item spans multiple days."""
    with transaction.atomic():  # Ensure atomic operations
        # Close the first day's logbook item at 11:59:59 PM
        first_day_end = make_aware(datetime.combine(logbook_item.start_time.date(), datetime.max.time()))
        close_logbook_item(logbook_item, first_day_end)

        # Process all missing days
        create_logbook_entries_for_missing_days(logbook_item, first_day_end, end_time)


def create_logbook_entries_for_missing_days(logbook_item, first_day_end, end_time):
    """Creates logbook items for each missing day and ensures DriverLogbook exists."""
    current_start = first_day_end + timedelta(seconds=1)  # Next day starts at 12:00 AM
    last_driver_logbook = None  # Track the last created driver logbook

    while current_start.date() < end_time.date():
        last_driver_logbook = get_or_create_driver_logbook(logbook_item, current_start.date())
        next_end = make_aware(datetime.combine(current_start.date(), datetime.max.time()))  # 11:59 PM

        create_logbook_item(logbook_item, last_driver_logbook, current_start, next_end)
        current_start = next_end + timedelta(seconds=1)  # Move to next day

    # Handle the last day's entry, ensuring the end time is now
    last_driver_logbook = get_or_create_driver_logbook(logbook_item, now().date())
    create_logbook_item(logbook_item, last_driver_logbook, current_start, end_time)  # Use correct logbook and end time


def get_or_create_driver_logbook(logbook_item, log_date):
    """Retrieves or creates a DriverLogbook entry for a given date."""
    return DriverLogbook.objects.get_or_create(
        driver=logbook_item.driver_logbook.driver,
        logbook_date=log_date,
        defaults={"truck": logbook_item.driver_logbook.truck},
    )[
        0
    ]  # Return only the instance


def create_logbook_item(logbook_item, driver_logbook, start_time, end_time):
    """Creates a new logbook item entry for a given period."""
    LogbookItem.objects.create(
        driver_logbook=driver_logbook,
        item_type=logbook_item.item_type,
        start_time=start_time,
        end_time=end_time,
        remarks=logbook_item.remarks,
        is_current=False,
    )
