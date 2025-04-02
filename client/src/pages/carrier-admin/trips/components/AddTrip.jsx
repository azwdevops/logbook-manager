// Import necessary React hooks, Redux functions, and custom components/utilities
import React, { useEffect, useState } from "react";
import CustomModal from "@/components/shared/CustomModal";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import API from "@/utils/API";
import { fetchLocationName, showError } from "@/utils";
import LocationMap from "@/components/shared/trips/LocationMap";
import LocationSearch from "@/components/shared/trips/LocationSearch";

// Define the AddTrip component
const AddTrip = ({ openAddTrip, setOpenAddTrip, tripsList, setTripsList }) => {
  const dispatch = useDispatch();

  // State to store trip details
  const [tripDetails, setTripDetails] = useState({
    pickupLocation: { name: "", coords: null }, // Pickup location data
    dropoffLocation: { name: "", coords: null }, // Dropoff location data
    currentLocation: { name: "", coords: null }, // Current location data
    currentCycle: "", // Current cycle (60-hour/7-day or 70-hour/8-day)
  });

  // useEffect hook to get current location on component mount
  useEffect(() => {
    // Attempt to fetch the current position using geolocation API
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Fetch location name from coordinates
        const locationName = await fetchLocationName(latitude, longitude);

        // Update the current location state with the fetched location name and coordinates
        setTripDetails((prev) => ({
          ...prev,
          currentLocation: { name: locationName, coords: { lat: latitude, lng: longitude } },
        }));
      },
      () => console.log("Unable to fetch location") // Fallback if geolocation fails
    );
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle location selection (pickup, dropoff, or current location)
  const handleLocationSelect = (field, name, coords) => {
    setTripDetails((prev) => ({
      ...prev,
      [field]: { name, coords }, // Update the specific field in the tripDetails state
    }));
  };

  // Function to handle form submission and send trip data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    dispatch(toggleLoading(true)); // Show loading indicator while the request is being processed
    const body = {
      pickup_location: tripDetails.pickupLocation,
      dropoff_location: tripDetails.dropoffLocation,
      current_location: tripDetails.currentLocation,
      cycle_used: tripDetails.currentCycle,
    };

    // Send a POST request to add a new trip
    await API.post(`/logbook/add-trip/`, body)
      .then((res) => {
        // On success, update the trips list and reset trip details
        setTripsList([...tripsList, res.data.new_trip_data]);
        setTripDetails({
          pickupLocation: { name: "", coords: null },
          dropoffLocation: { name: "", coords: null },
          currentLocation: { name: "", coords: null },
          currentCycle: "",
        });
        window.alert(res?.data?.message); // Show success message
        setOpenAddTrip(false); // Close the modal
      })
      .catch((err) => showError(err)) // Handle error response
      .finally(() => dispatch(toggleLoading(false))); // Hide loading indicator
  };

  return (
    // Modal to add a new trip
    <CustomModal isOpen={openAddTrip} maxWidth="1200px" maxHeight="900px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Enter Trip Details</h3>
        <p className="bd">
          Your Current Location: <span className="green">{tripDetails?.currentLocation?.name}</span>
        </p>

        {/* Row for current location and pickup location */}
        <div className="dialog-row">
          <span>
            <label>
              Current Location <span className="green">(If different from above location)</span>
            </label>
            {/* LocationSearch component for selecting current location */}
            <LocationSearch
              value={tripDetails.currentLocation.name}
              onSelect={(name, coords) => handleLocationSelect("currentLocation", name, coords)}
            />
          </span>
          <span>
            <label>Pickup Location</label>
            {/* LocationSearch component for selecting pickup location */}
            <LocationSearch
              value={tripDetails.pickupLocation.name}
              onSelect={(name, coords) => handleLocationSelect("pickupLocation", name, coords)}
            />
          </span>
        </div>

        {/* Row for dropoff location and cycle used */}
        <div className="dialog-row">
          <span>
            <label>Dropoff Location</label>
            {/* LocationSearch component for selecting dropoff location */}
            <LocationSearch
              value={tripDetails.dropoffLocation.name}
              onSelect={(name, coords) => handleLocationSelect("dropoffLocation", name, coords)}
            />
          </span>
          <span>
            <label>Cycle Used</label>
            {/* Dropdown for selecting the cycle used */}
            <select
              name="currentCycle"
              value={tripDetails.currentCycle}
              onChange={(e) => setTripDetails({ ...tripDetails, currentCycle: e.target.value })}
              required
            >
              <option value="">--select cycle--</option>
              <option value="60-hour/7-day">60 hour/7 days</option>
              <option value="70-hour/8-day">70 hour/8 days</option>
            </select>
          </span>
        </div>

        <div className="dialog-row-single-item"></div>

        {/* Display the map for trip details */}
        <div className="dialog-row-single-item">
          <label>Map</label>
          <LocationMap tripDetails={tripDetails} />
        </div>

        {/* Buttons for closing the modal or submitting the form */}
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenAddTrip(false)}>
            Close
          </button>
          <button type="submit">Add Trip</button>
        </div>
      </form>
    </CustomModal>
  );
};

// Export the AddTrip component as default
export default AddTrip;
