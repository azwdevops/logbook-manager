from datetime import timedelta

from django.db import transaction
from django.utils.timezone import now, localtime
from django.contrib.auth.models import Group
from django.conf import settings

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from logbook.api.serializers import (
    CarrierViewSerializer,
    TripDetailSerializer,
    TripDetailViewSerializer,
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
    TruckSerializer,
    TruckViewSerializer,
)
from logbook.models import Carrier, TripDetail, TripItem, TripDay, Truck
from core.utils import get_object_or_none
from core.exceptions import MissingItemError, RequestFailedError, ItemExistsError
from users.models import User


class MaintainCarriers(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user_exists = get_object_or_none(User, email=request.data["email"])
        if user_exists:
            raise RequestFailedError("Error, user with this email already exists", status_code=400)
        carrier_exists = get_object_or_none(Carrier, name=request.data["name"])

        if carrier_exists:
            raise RequestFailedError("Error, carrier with this name already exists", status_code=400)

        carrier_admin = User.objects.create(
            email=request.data["email"],
            first_name=request.data["first_name"],
            last_name=request.data["last_name"],
        )
        carrier_admin.set_password(request.data["password"])
        carrier_admin.is_carrier_admin = True
        carrier_admin.save()

        carrier_admin_group = Group.objects.get(name=settings.CARRIER_ADMIN_GROUP)
        carrier_admin_group.user_set.add(carrier_admin)

        new_carrier = Carrier.objects.create(name=request.data["name"], admin=carrier_admin)

        carrier_admin.carrier = new_carrier
        carrier_admin.save()

        new_carrier_data = CarrierViewSerializer(new_carrier).data

        return Response({"message": "Carrier added successfully", "new_carrier_data": new_carrier_data}, status=201)

    @transaction.atomic
    def patch(self, request):
        carrier = get_object_or_none(Carrier, id=request.data["id"])
        if not carrier:
            raise MissingItemError("Error, invalid carrier selected", status_code=400)
        carrier.name = request.data["name"]
        carrier.save()

        carrier.admin.email = request.data["email"]
        carrier.admin.save()

        updated_carrier_data = CarrierViewSerializer(carrier).data

        return Response(
            {"message": "Carrier updated successfully", "updated_carrier_data": updated_carrier_data}, status=200
        )

    def get(self, request):
        carriers = Carrier.objects.all()
        carriers_data = CarrierViewSerializer(carriers, many=True).data

        return Response({"message": "success", "carriers_data": carriers_data}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def add_trip(request):
    serializer = TripDetailSerializer(data={**request.data, "carrier": request.user.carrier.id})
    serializer.is_valid(raise_exception=True)
    new_trip = serializer.save()

    new_trip_data = TripDetailViewSerializer(new_trip).data

    return Response({"message": "Trip added successfully", "new_trip_data": new_trip_data}, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def carrier_get_trips(request):
    trips = TripDetail.objects.filter(carrier=request.user.carrier).order_by("-trip_start_date")

    trips_data = TripDetailViewSerializer(trips, many=True).data

    return Response({"message": "success", "trips_data": trips_data}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_trips(request):
    trips = TripDetail.objects.filter(driver=request.user).order_by("-trip_start_date")[:5]

    trips_data = MultipleTripDetailViewSerializer(trips, many=True).data

    return Response({"message": "success", "trips_data": trips_data}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_trip(request):
    current_trips = TripDetail.objects.filter(is_current=True, driver=request.user).order_by("-trip_start_date")
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
    serializer = TripItemSerializer(data={**request.data, "start_time": localtime(now())})
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
    try:
        TripItem.objects.filter(id=request.data["current_trip_item_id"]).update(end_time=now(), is_current=False)
    except:
        pass

    trip = get_object_or_none(TripDetail, id=request.data["tripId"])
    if not trip:
        raise MissingItemError("Error, invalid trip submitted", status_code=400)
    trip.is_current = False
    trip.is_done = True
    trip.trip_end_date = localtime(now()).date()
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
        raise MissingItemError("Error, invalid logbook selected.", status_code=400)
    trip_day_data = TripDayLogbookView(trip_day, context={"request_user": request.user}).data

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
    local_time = localtime(now())
    trip_day_closed = get_object_or_none(
        TripDay, trip_date=local_time.date(), trip_detail__id=request.data["trip_detail_id"]
    )
    if trip_day_closed:
        raise RequestFailedError(
            "Request failed, you have already closed the day today. You can only start another day tomorrow",
            status_code=400,
        )
    # create a new trip day
    trip_day_serializer = TripDaySerializer(
        data={
            "trip_detail": request.data["trip_detail_id"],
            "trip_date": local_time.date(),
            "is_current": True,
        }
    )
    trip_day_serializer.is_valid(raise_exception=True)
    new_trip_day = trip_day_serializer.save()

    serializer = TripItemSerializer(data={**request.data, "trip_day": new_trip_day.id, "start_time": local_time})
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


class MaintainTrucks(APIView):
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        serializer = TruckSerializer(data={**request.data, "carrier": request.user.carrier.id})
        serializer.is_valid(raise_exception=True)
        new_truck = serializer.save()

        new_truck_data = TruckViewSerializer(new_truck).data

        return Response({"message": "Truck added successfully", "new_truck_data": new_truck_data}, status=201)

    @transaction.atomic
    def patch(self, request):
        truck = get_object_or_none(Truck, id=request.data["id"])
        if not truck:
            raise MissingItemError("Error, invalid truck selected", status_code=400)
        serializer = TruckSerializer(truck, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_truck = serializer.save()

        updated_truck_data = TruckViewSerializer(updated_truck).data

        return Response({"message": "Truck updated successfully", "updated_truck_data": updated_truck_data}, status=200)

    def get(self, request):
        trucks = Truck.objects.filter(carrier=request.user.carrier, truck_assigned=False)
        trucks_data = TruckViewSerializer(trucks, many=True).data

        return Response({"message": "success", "trucks_data": trucks_data}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def assign_trip_driver(request):
    driver = get_object_or_none(User, id=request.data["driverId"])
    if not driver:
        raise MissingItemError("Error, the driver selected is not valid", status_code=400)

    truck = get_object_or_none(Truck, id=request.data["truckId"])
    if not truck:
        raise MissingItemError("Error, the truck selected is not valid", status_code=400)

    trip_detail = TripDetail.objects.get(id=request.data["tripId"])

    if not trip_detail:
        raise MissingItemError("Error, the trip selected is not valid", status_code=400)
    trip_detail.driver = driver
    trip_detail.truck = truck
    trip_detail.is_current = True
    trip_detail.trip_start_date = request.data["tripStartDate"]
    trip_detail.save()

    driver.driver_assigned = True
    driver.save()

    truck.truck_assigned = True
    truck.save()

    updated_trip_data = TripDetailViewSerializer(trip_detail).data

    return Response({"message": "Driver assigned successfully", "updated_trip_data": updated_trip_data}, status=200)
