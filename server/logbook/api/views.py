from datetime import datetime

from django.db import transaction
from django.conf import settings
from django.contrib.auth.models import Group
from django.utils.timezone import make_aware, now

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from core.utils import get_object_or_none, update_logbook_item_over_multiple_days
from core.exceptions import RequestFailedError, MissingItemError
from users.models import User
from logbook.models import Carrier, Truck, TripDetail, DriverLogbook, LogbookItem
from logbook.api.serializers import (
    CarrierViewSerializer,
    TruckSerializer,
    TruckViewSerializer,
    TripDetailSerializer,
    TripDetailViewSerializer,
    TripSummaryViewSerializer,
    SingleTripDetailViewSerializer,
    DriverLogbookViewSerializer,
    LogbookItemSerializer,
    LogbookItemViewSerializer,
    StopRestSerializer,
    TripRouteViewSerializer,
    MultipleTripDetailViewSerializer,
    LogbookDetailViewSerializer,
)


class MaintainCarriers(APIView):
    # Define the permission class to ensure that only authenticated users can access this view
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        """
        Handles the creation of a new carrier and its admin user.

        Checks if the user with the provided email or carrier with the provided name already exists.
        If they do, raises a `RequestFailedError` with an appropriate message.
        Otherwise, creates a new user as the carrier admin, assigns them to a specific group,
        and then creates a new carrier linked to the new user.
        """
        # Check if a user already exists with the provided email
        user_exists = get_object_or_none(User, email=request.data["email"])
        if user_exists:
            # Raise error if the user exists
            raise RequestFailedError("Error, user with this email already exists", status_code=400)

        # Check if a carrier already exists with the provided name
        carrier_exists = get_object_or_none(Carrier, name=request.data["name"])
        if carrier_exists:
            # Raise error if the carrier exists
            raise RequestFailedError("Error, carrier with this name already exists", status_code=400)

        # Create a new carrier admin user
        carrier_admin = User.objects.create(
            email=request.data["email"],
            first_name=request.data["first_name"],
            last_name=request.data["last_name"],
        )
        # Set the password for the carrier admin user
        carrier_admin.set_password(request.data["password"])
        carrier_admin.is_carrier_admin = True  # Mark this user as a carrier admin
        carrier_admin.save()  # Save the carrier admin user

        # Add the carrier admin user to a predefined group
        carrier_admin_group = Group.objects.get(name=settings.CARRIER_ADMIN_GROUP)
        carrier_admin_group.user_set.add(carrier_admin)

        # Create a new carrier and associate it with the carrier admin
        new_carrier = Carrier.objects.create(name=request.data["name"], admin=carrier_admin)

        # Link the new carrier to the carrier admin user
        carrier_admin.carrier = new_carrier
        carrier_admin.save()

        # Serialize the new carrier data
        new_carrier_data = CarrierViewSerializer(new_carrier).data

        # Return a successful response with the new carrier data
        return Response({"message": "Carrier added successfully", "new_carrier_data": new_carrier_data}, status=201)

    @transaction.atomic
    def patch(self, request):
        """
        Handles the update of an existing carrier's details.

        Checks if the carrier exists using the provided carrier ID,
        updates the carrier name and admin's email, and returns the updated carrier data.
        """
        # Retrieve the carrier based on the provided ID
        carrier = get_object_or_none(Carrier, id=request.data["id"])
        if not carrier:
            # Raise error if the carrier is not found
            raise MissingItemError("Error, invalid carrier selected", status_code=400)

        # Update the carrier name
        carrier.name = request.data["name"]
        carrier.save()  # Save the updated carrier

        # Update the email of the carrier admin
        carrier.admin.email = request.data["email"]
        carrier.admin.save()  # Save the updated carrier admin

        # Serialize the updated carrier data
        updated_carrier_data = CarrierViewSerializer(carrier).data

        # Return a successful response with the updated carrier data
        return Response(
            {"message": "Carrier updated successfully", "updated_carrier_data": updated_carrier_data}, status=200
        )

    def get(self, request):
        """
        Handles fetching the list of all carriers.

        Returns the data of all carriers serialized in the response.
        """
        # Retrieve all carriers from the database
        carriers = Carrier.objects.all()

        # Serialize the carriers data
        carriers_data = CarrierViewSerializer(carriers, many=True).data

        # Return a successful response with the list of carriers
        return Response({"message": "success", "carriers_data": carriers_data}, status=200)


class MaintainTrucks(APIView):
    permission_classes = (IsAuthenticated,)  # Ensures that only authenticated users can access this view

    @transaction.atomic  # Ensures all database changes are committed atomically
    def post(self, request):
        """
        Adds a new truck for the carrier.

        This view handles the creation of a new truck by serializing the provided data,
        validating it, saving the truck, and returning the truck data in the response.
        """
        # Serialize the request data and add the carrier ID to the data
        serializer = TruckSerializer(data={**request.data, "carrier": request.user.carrier.id})

        # Validate the serialized data
        serializer.is_valid(raise_exception=True)

        # Save the new truck to the database
        new_truck = serializer.save()

        # Serialize the saved truck data to return in the response
        new_truck_data = TruckViewSerializer(new_truck).data

        # Return a successful response with the truck data
        return Response({"message": "Truck added successfully", "new_truck_data": new_truck_data}, status=201)

    @transaction.atomic  # Ensures all database changes are committed atomically
    def patch(self, request):
        """
        Updates an existing truck's details.

        This view handles updating a truck's information by first fetching the truck
        using the provided ID, serializing the updated data, and saving it to the database.
        """
        # Fetch the truck by its ID
        truck = get_object_or_none(Truck, id=request.data["id"])

        # If the truck is not found, raise an error
        if not truck:
            raise MissingItemError("Error, invalid truck selected", status_code=400)

        # Serialize the truck with the updated data from the request
        serializer = TruckSerializer(truck, data=request.data)

        # Validate the serialized data
        serializer.is_valid(raise_exception=True)

        # Save the updated truck data
        updated_truck = serializer.save()

        # Serialize the updated truck data to return in the response
        updated_truck_data = TruckViewSerializer(updated_truck).data

        # Return a successful response with the updated truck data
        return Response({"message": "Truck updated successfully", "updated_truck_data": updated_truck_data}, status=200)

    def get(self, request):
        """
        Retrieves all trucks that are not assigned to a driver for the carrier.

        This view returns a list of trucks associated with the current user's carrier that
        are currently not assigned to any driver.
        """
        # Get all trucks associated with the user's carrier that are not assigned to a driver
        trucks = Truck.objects.filter(carrier=request.user.carrier, truck_assigned=False)

        # Serialize the trucks data
        trucks_data = TruckViewSerializer(trucks, many=True).data

        # Return a successful response with the serialized truck data
        return Response({"message": "success", "trucks_data": trucks_data}, status=200)


@api_view(["POST"])  # This decorator indicates that this view only accepts POST requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
@transaction.atomic  # Ensures that the entire transaction is atomic (either fully complete or fully rollback on failure)
def add_trip(request):
    """
    Handles the creation of a new trip.

    This view expects the request to contain the trip details. It adds the current user's carrier ID
    to the request data, validates the data using the serializer, saves the new trip, and then
    returns the serialized data of the newly created trip.
    """
    # Combine the incoming request data with the carrier ID of the currently authenticated user
    serializer = TripDetailSerializer(data={**request.data, "carrier": request.user.carrier.id})

    # Validate the data and raise an exception if the data is invalid
    serializer.is_valid(raise_exception=True)

    # Save the new trip object into the database
    new_trip = serializer.save()

    # Serialize the new trip data to be included in the response
    new_trip_data = TripDetailViewSerializer(new_trip).data

    # Return a successful response with the newly created trip data
    return Response({"message": "Trip added successfully", "new_trip_data": new_trip_data}, status=201)


@api_view(["GET"])  # This decorator indicates that this view only accepts GET requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
def carrier_get_trips(request):
    """
    Retrieves all trips associated with the authenticated user's carrier.

    This view filters trips based on the carrier ID of the authenticated user, orders them by
    the trip start date in descending order, and then returns the serialized data of the trips.
    """
    # Filter trips that belong to the authenticated user's carrier, ordered by trip start date in descending order
    trips = TripDetail.objects.filter(carrier=request.user.carrier).order_by("-trip_start_date")

    # Serialize the filtered trips to include in the response
    trips_data = TripDetailViewSerializer(trips, many=True).data

    # Return a successful response with the serialized trip data
    return Response({"message": "success", "trips_data": trips_data}, status=200)


@api_view(["POST"])  # This view handles POST requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
@transaction.atomic  # Ensures all database changes are committed atomically
def assign_trip_driver(request):
    """
    Assigns a driver and a truck to a trip.

    This view receives the driver, truck, and trip details, validates them, and then assigns
    the driver and truck to the specified trip. It also updates the assignment status of
    both the driver and the truck.
    """
    # Fetch the driver by their ID from the request data
    driver = get_object_or_none(User, id=request.data["driverId"])

    # If the driver does not exist, raise an error
    if not driver:
        raise MissingItemError("Error, the driver selected is not valid", status_code=400)

    # Fetch the truck by its ID from the request data
    truck = get_object_or_none(Truck, id=request.data["truckId"])

    # If the truck does not exist, raise an error
    if not truck:
        raise MissingItemError("Error, the truck selected is not valid", status_code=400)

    # Fetch the trip details using the trip ID from the request data
    trip_detail = TripDetail.objects.get(id=request.data["tripId"])

    # If the trip does not exist, raise an error
    if not trip_detail:
        raise MissingItemError("Error, the trip selected is not valid", status_code=400)

    # Assign the driver and truck to the trip
    trip_detail.driver = driver
    trip_detail.truck = truck
    trip_detail.is_current = True  # Mark the trip as current
    trip_detail.trip_start_date = request.data["tripStartDate"]  # Set the trip start date
    trip_detail.save()  # Save the updated trip details

    # Mark the driver as assigned
    driver.driver_assigned = True
    driver.save()  # Save the updated driver status

    # Mark the truck as assigned
    truck.truck_assigned = True
    truck.save()  # Save the updated truck status

    # Serialize the updated trip details to return in the response
    updated_trip_data = TripDetailViewSerializer(trip_detail).data

    # Return a success response with the updated trip data
    return Response({"message": "Driver assigned successfully", "updated_trip_data": updated_trip_data}, status=200)


@api_view(["GET"])  # This decorator indicates that this view only accepts GET requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
def get_trip_summary(request, tripId):
    """
    Retrieves the summary data for a specific trip.

    This view fetches the summary data associated with the given trip ID and returns it.
    If the provided trip ID is invalid, it raises an error.
    """
    # Fetch the trip detail using the provided trip ID
    trip_detail = get_object_or_none(TripDetail, id=tripId)

    # If the trip is not found, raise an error
    if not trip_detail:
        raise MissingItemError("Error, invalid trip selected", status_code=400)

    # Serialize the trip summary data for the trip detail
    trip_summary_data = TripSummaryViewSerializer(trip_detail).data

    # Return a successful response with the serialized trip summary data
    return Response({"trip_summary_data": trip_summary_data}, status=200)


@api_view(["GET"])  # This decorator indicates that this view only accepts GET requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
def get_current_trip(request):
    """
    Retrieves the current trip for the authenticated driver.

    This view filters trips based on the 'is_current' flag and the driver ID of the authenticated user.
    If a current trip exists, it returns the serialized data of the most recent current trip.
    If no current trip exists, it returns None.
    """
    # Filter trips that are marked as current for the authenticated driver, ordered by trip start date in descending order
    current_trips = TripDetail.objects.filter(is_current=True, driver=request.user).order_by("-trip_start_date")

    # Check if there is a current trip
    if current_trips.exists():
        # If a current trip exists, serialize the first (most recent) current trip
        current_trip_data = SingleTripDetailViewSerializer(current_trips[0]).data
    else:
        # If no current trip exists, set the data to None
        current_trip_data = None

    current_logbook_item_data = None
    driver_logbook_data = None
    if request.user.is_driver:
        driver_logbook, _ = DriverLogbook.objects.get_or_create(
            driver=request.user, logbook_date=make_aware(datetime.now()).date()
        )
        if current_trips.exists():
            driver_logbook.truck = current_trips[0].truck
            driver_logbook.save()
        driver_logbook_data = DriverLogbookViewSerializer(driver_logbook).data
        logbook_items = LogbookItem.objects.filter(driver_logbook__driver=request.user, is_current=True).order_by(
            "-start_time"
        )
        if logbook_items.exists():
            current_logbook_item = logbook_items[0]
            current_logbook_item_data = LogbookItemViewSerializer(current_logbook_item).data

    # Return a successful response with the current trip data (or None if no current trip exists)
    return Response(
        {
            "message": "success",
            "current_trip_data": current_trip_data,
            "driver_logbook_data": driver_logbook_data,
            "current_logbook_item_data": current_logbook_item_data,
        },
        status=200,
    )


@api_view(["POST"])  # This decorator indicates that this view only accepts POST requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
@transaction.atomic  # Ensures that the transaction is atomic, meaning all changes will be committed or none at all
def change_status(request):
    if request.data["currentLogbookItemId"]:
        update_logbook_item_over_multiple_days(request)
    driver_logbook, _ = DriverLogbook.objects.get_or_create(logbook_date=now().date(), driver=request.user)
    # Serialize the incoming data and add the start time for the new logbook item
    serializer = LogbookItemSerializer(
        data={**request.data, "start_time": make_aware(datetime.now()), "driver_logbook": driver_logbook.id}
    )

    # Validate the data and raise an exception if invalid
    serializer.is_valid(raise_exception=True)

    # Save the new logbook item to the database
    new_logbook_item = serializer.save()

    # Serialize the newly created logbook item for the response
    new_logbook_item_data = LogbookItemViewSerializer(new_logbook_item).data

    # driver logbook may be different i change status is happening on a different date
    driver_logbook_data = DriverLogbookViewSerializer(driver_logbook).data

    # Return a successful response with the serialized logbook item data
    return Response(
        {
            "message": "Status updated successfully",
            "new_logbook_item_data": new_logbook_item_data,
            "driver_logbook_data": driver_logbook_data,
        },
        status=201,
    )


@api_view(["POST"])  # This decorator indicates that this view only accepts POST requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
@transaction.atomic  # Ensures that the transaction is atomic, meaning all changes will be committed or none at all
def record_stop(request):
    """
    Records a new stop.

    This view validates the incoming stop data, saves the new stop object to the database,
    and returns a success message in the response.
    """
    # Serialize the incoming request data for the stop
    serializer = StopRestSerializer(data=request.data)

    # Validate the data and raise an exception if invalid
    serializer.is_valid(raise_exception=True)

    # Save the new stop to the database
    new_stop = serializer.save()

    # Return a successful response indicating the stop was recorded
    return Response({"message": "Stop recorded successfully"}, status=201)


@api_view(["GET"])  # This decorator indicates that this view only accepts GET requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
def get_trip_route(request, tripId):
    """
    Retrieves the route map details for a specific trip.

    This view fetches the route map data associated with the given trip ID and returns it.
    If the provided trip ID is invalid, it raises an error.
    """
    # Fetch the trip detail using the provided trip ID
    trip_detail = get_object_or_none(TripDetail, id=tripId)

    # If the trip is not found, raise an error
    if not trip_detail:
        raise MissingItemError("Error, invalid trip selected", status_code=400)

    # Serialize the route map data for the trip detail
    route_map_data = TripRouteViewSerializer(trip_detail).data

    # Return a successful response with the serialized route map data
    return Response({"message": "success", "route_map_data": route_map_data}, status=200)


@api_view(["GET"])  # This decorator indicates that this view only accepts GET requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
def driver_get_trips(request):
    """
    Retrieves the latest 5 trips associated with the authenticated driver.

    This view filters trips based on the driver ID of the authenticated user, orders them by
    the trip start date in descending order, and limits the results to the most recent 5 trips.
    The data is then serialized and returned in the response.
    """
    # Filter trips that belong to the authenticated driver, ordered by trip start date in descending order,
    # and limit the results to the most recent 5 trips
    trips = TripDetail.objects.filter(driver=request.user, is_done=True).order_by("-trip_start_date")[:5]

    # Serialize the filtered trips to include in the response
    trips_data = MultipleTripDetailViewSerializer(trips, many=True).data

    # Return a successful response with the serialized trip data
    return Response({"message": "success", "trips_data": trips_data}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_driver_logbooks(request):
    logbooks = DriverLogbook.objects.filter(
        driver__id=request.data["driverId"],
        logbook_date__gte=request.data["startDate"],
        logbook_date__lte=request.data["endDate"],
    ).order_by("-logbook_date")

    if not logbooks.exists():
        raise MissingItemError("No logbooks available for the selected period", status_code=400)

    logbooks_data = logbooks.values("id", "logbook_date")

    return Response({"message": "success", "logbooks_data": logbooks_data}, status=200)


@api_view(["GET"])  # This decorator indicates that this view only accepts GET requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
def get_logbook_detail(request, logbookId):
    logbook = get_object_or_none(DriverLogbook, id=logbookId)

    if not logbook:
        raise MissingItemError("Error, invalid logbook selected", status_code=400)

    # Serialize the logbook data using the TripDayLogbookView serializer
    logbook_data = LogbookDetailViewSerializer(logbook, context={"driver_id": logbook.driver.id}).data

    # Return a successful response with the serialized logbook data
    return Response({"message": "success", "logbook_data": logbook_data}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def driver_end_trip(request):
    trip = get_object_or_none(TripDetail, id=request.data["tripId"])
    # If the trip is not found, raise an error
    if not trip:
        raise MissingItemError("Error, invalid trip submitted", status_code=400)

    # Mark the trip as completed and set the end date
    trip.is_current = False
    trip.is_done = True
    trip.trip_end_date = now().date()
    trip.save()

    request.user.driver_assigned = False
    request.user.save()

    return Response({"message": "Trip ended successfully"}, status=200)


@api_view(["POST"])  # This decorator indicates that this view only accepts POST requests
@permission_classes([IsAuthenticated])  # Ensures that only authenticated users can access this view
@transaction.atomic  # Ensures that all database changes are committed atomically (all or none)
def record_mileage_covered_today(request):
    driver_logbook = get_object_or_none(DriverLogbook, id=request.data["currentDriverLogbookId"])

    # If the logbook is not found, raise an error
    if not driver_logbook:
        raise MissingItemError("Error, driver logbook does not exist", status_code=400)

    # Update the total miles driven today
    driver_logbook.total_miles_driving_today = request.data["total_miles_driving_today"]

    # Set the mileage covered today; if it's not provided, use the total miles driven today
    driver_logbook.mileage_covered_today = (
        request.data["mileage_covered_today"]
        if request.data["mileage_covered_today"] != ""
        else request.data["total_miles_driving_today"]
    )
    driver_logbook.save()

    # Return a successful response indicating that the mileage was recorded
    return Response({"message": "Mileage recorded successfully"}, status=200)
