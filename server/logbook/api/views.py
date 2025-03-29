from datetime import timedelta

from django.db import transaction
from django.utils.timezone import now

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from logbook.api.serializers import (
    TripDetailSerializer,
    MultipleTripDetailViewSerializer,
    StopRestSerializer,
    SingleTripDetailViewSerializer,
    TripItemSerializer,
    TripItemViewSerializer,
    TripDayLogbookView,
    TripDaySerializer,
    TripDayViewSerializer,
    TripRouteViewSerializer,
    TripSummaryViewSerializer,
)
from logbook.models import TripDetail, TripItem, TripDay
from core.utils import get_object_or_none
from core.exceptions import MissingItemError, RequestFailedError


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def add_trip(request):
    serializer = TripDetailSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    new_trip = serializer.save()

    # create a new trip day
    trip_day_serializer = TripDaySerializer(
        data={"trip_detail": new_trip.id, "trip_date": request.data["trip_start_date"], "is_current": True}
    )
    trip_day_serializer.is_valid(raise_exception=True)
    new_trip_day = trip_day_serializer.save()
    current_trip_data = SingleTripDetailViewSerializer(new_trip).data

    # we create a stop for the current location since we will use this in the route map
    stop_data = {
        "trip_day": new_trip_day.id,
        "stop_location": request.data["current_location"],
        "stop_type": "Starting Location",
        "start_time": request.data["start_time"],
        "end_time": request.data["end_time"],
    }

    serializer = StopRestSerializer(data=stop_data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    trip_day_data = TripDayViewSerializer(new_trip_day).data

    return Response(
        {"message": "Trip added successfully", "current_trip_data": current_trip_data, "trip_day_data": trip_day_data},
        status=201,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_trips(request):
    trips = TripDetail.objects.filter(driver=request.user).order_by("-trip_start_date")[:5]

    trips_data = MultipleTripDetailViewSerializer(trips, many=True).data

    return Response({"message": "success", "trips_data": trips_data}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_trip(request):
    current_trips = TripDetail.objects.filter(is_current=True).order_by("-trip_start_date")
    if current_trips.exists():
        current_trip_data = SingleTripDetailViewSerializer(current_trips[0]).data
    else:
        current_trip_data = None
    return Response({"message": "success", "current_trip_data": current_trip_data}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def change_trip_status(request):
    if request.data["current_trip_item"]:
        TripItem.objects.filter(id=request.data["current_trip_item"]["id"]).update(end_time=now(), is_current=False)
    serializer = TripItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    trip_item = serializer.save()

    trip_item_data = TripItemViewSerializer(trip_item).data

    return Response({"message": "Trip status updated successfully", "trip_item_data": trip_item_data}, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def record_stop(request):
    serializer = StopRestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    new_stop = serializer.save()

    return Response({"message": "Stop recorded successfully"}, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def end_trip(request):
    if request.data["current_trip_item_id"]:
        TripItem.objects.filter(id=request.data["current_trip_item_id"]).update(end_time=now(), is_current=False)
    trip = get_object_or_none(TripDetail, id=request.data["tripId"])
    if not trip:
        raise MissingItemError("Error, invalid trip submitted", status_code=400)
    trip.is_current = False
    trip.is_done = True
    trip.trip_end_date = request.data["trip_end_date"]
    trip.save()

    if request.data["close_trip_day"]:
        trip_day = get_object_or_none(TripDay, id=request.data["trip_day_id"])
        if not trip_day:
            raise MissingItemError("Error, invalid trip day selected", status_code=400)
        trip_day.total_miles_driving_today = request.data["total_miles_driving_today"]
        trip_day.mileage_covered_today = (
            request.data["mileage_covered_today"]
            if request.data["mileage_covered_today"] != ""
            else request.data["total_miles_driving_today"]
        )
        trip_day.is_current = False
        trip_day.is_done = True
        trip_day.save()

        TripItem.objects.filter(id=request.data["current_trip_item_id"]).update(end_time=now(), is_current=False)

    return Response({"message": "Trip successfully completed"}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_logbook_detail(request, tripId, logbookIndex):
    trip = get_object_or_none(TripDetail, id=tripId)
    if not trip:
        raise MissingItemError("Error, invalid logbook selected", status_code=400)
    trip_date = trip.trip_start_date + timedelta(days=logbookIndex)
    trip_day = get_object_or_none(TripDay, trip_detail=trip, trip_date=trip_date)
    if not trip_day:
        raise MissingItemError("Error, invalid logbook selected.")
    trip_day_data = TripDayLogbookView(trip_day).data

    return Response({"message": "success", "trip_day_data": trip_day_data}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def close_trip_day(request):
    trip_day = get_object_or_none(TripDay, id=request.data["trip_day_id"])
    if not trip_day:
        raise MissingItemError("Error, invalid trip day selected", status_code=400)
    trip_day.total_miles_driving_today = request.data["total_miles_driving_today"]
    trip_day.mileage_covered_today = (
        request.data["mileage_covered_today"]
        if request.data["mileage_covered_today"] != ""
        else request.data["total_miles_driving_today"]
    )
    trip_day.is_current = False
    trip_day.is_done = True
    trip_day.save()

    TripItem.objects.filter(id=request.data["current_trip_item_id"]).update(end_time=now(), is_current=False)

    return Response({"message": "Trip day successfully closed"}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def start_trip_day(request):
    trip_day_closed = get_object_or_none(
        TripDay, trip_date=request.data["trip_date"], trip_detail__id=request.data["trip_detail_id"]
    )
    if trip_day_closed:
        raise RequestFailedError(
            "Request failed, you have already closed the day today. You can only start another day tomorrow",
            status_code=400,
        )
    # create a new trip day
    trip_day_serializer = TripDaySerializer(
        data={"trip_detail": request.data["trip_detail_id"], "trip_date": request.data["trip_date"], "is_current": True}
    )
    trip_day_serializer.is_valid(raise_exception=True)
    new_trip_day = trip_day_serializer.save()

    serializer = TripItemSerializer(data={**request.data, "trip_day": new_trip_day.id})
    serializer.is_valid(raise_exception=True)
    trip_item = serializer.save()

    trip_item_data = TripItemViewSerializer(trip_item).data
    trip_day_data = TripDayViewSerializer(new_trip_day).data

    return Response(
        {"message": "New day started successfully", "trip_item_data": trip_item_data, "trip_day_data": trip_day_data},
        status=201,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_trip_route(request, tripId):
    trip_detail = get_object_or_none(TripDetail, id=tripId)
    if not trip_detail:
        raise MissingItemError("Error, invalid trip selected", status_code=400)
    route_map_data = TripRouteViewSerializer(trip_detail).data

    return Response({"message": "success", "route_map_data": route_map_data}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_trip_summary(request, tripId):
    trip_detail = get_object_or_none(TripDetail, id=tripId)
    if not trip_detail:
        raise MissingItemError("Error, invalid trip selected", status_code=400)

    trip_summary_data = TripSummaryViewSerializer(trip_detail).data

    return Response({"trip_summary_data": trip_summary_data}, status=200)
