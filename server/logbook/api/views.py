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
    TripDetailLogbookView,
    TripDaySerializer,
)
from logbook.models import TripDetail, TripItem
from core.utils import get_object_or_none
from core.exceptions import MissingItemError


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
    trip_day_serializer.save()
    current_trip_data = SingleTripDetailViewSerializer(new_trip).data

    return Response({"message": "Trip added successfully", "current_trip_data": current_trip_data}, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_trips(request):
    current_trips = TripDetail.objects.filter(is_current=True).order_by("-trip_start_date")
    if current_trips.exists():
        current_trip_data = SingleTripDetailViewSerializer(current_trips[0]).data
    else:
        current_trip_data = None

    trips = TripDetail.objects.filter(driver=request.user).order_by("-trip_start_date")[:5]

    trips_data = MultipleTripDetailViewSerializer(trips, many=True).data

    return Response(
        {"message": "success", "trips_data": trips_data, "current_trip_data": current_trip_data}, status=200
    )


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
    if request.data["current_trip_item"]:
        TripItem.objects.filter(id=request.data["current_trip_item"]["id"]).update(end_time=now(), is_current=False)
    trip = get_object_or_none(TripDetail, id=request.data["tripId"])
    if not trip:
        raise MissingItemError("Error, invalid trip submitted", status_code=400)
    trip.is_current = False
    trip.is_done = False
    trip.trip_end_date = request.data["trip_end_date"]
    trip.save()

    return Response({"message": "Trip successfully completed"}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_logbook_detail(request, tripId):
    trip = get_object_or_none(TripDetail, id=tripId)
    if not trip:
        raise MissingItemError("Error, invalid trip selected", status_code=400)
    trip_details = TripDetailLogbookView(trip).data

    return Response({"message": "success", "trip_details": trip_details}, status=200)
