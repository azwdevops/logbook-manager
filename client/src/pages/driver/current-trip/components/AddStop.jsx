import React, { useState, useEffect } from "react"; // Import React and hooks (useState, useEffect)
import { Button } from "@mui/material"; // Import Button component from Material UI
import CustomModal from "@/components/shared/CustomModal"; // Import CustomModal component
import { useDispatch } from "react-redux"; // Import useDispatch hook for Redux state management
import { toggleLoading } from "@/redux/features/sharedSlice"; // Import toggleLoading action from Redux slice
import API from "@/utils/API"; // Import API utility for HTTP requests
import { fetchLocationName } from "@/utils"; // Import utility functions for location and error handling
import LocationMap from "@/components/shared/trips/LocationMap"; // Import LocationMap component to display a map
import LocationSearch from "@/components/shared/trips/LocationSearch"; // Import LocationSearch component for searching locations

// Array defining stop types for the trip
const stopTypes = ["Pickup", "Dropoff", "Fueling", "Rest"];

const AddStop = ({ openAddStop, setOpenAddStop, currentTripDay }) => {
  const dispatch = useDispatch(); // Initialize dispatch for Redux actions

  // State to manage stop details
  const [stop, setStop] = useState({
    type: "", // Type of stop (Pickup, Dropoff, etc.)
    location: "", // Location of the stop
    coords: null, // Geographical coordinates of the stop
    startTime: null, // Start time of the stop
    endTime: null, // End time of the stop
    isTiming: false, // Whether the stop time is being tracked
  });

  // useEffect hook to get the user's current location on component mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Fetch location name based on the coordinates
        const locationName = await fetchLocationName(latitude, longitude);

        // Set location and coordinates in state
        setStop((prev) => ({
          ...prev,
          location: locationName,
          coords: { lat: latitude, lng: longitude },
        }));
      },
      () => console.log("Unable to fetch location") // Error handling if location fetch fails
    );
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // useEffect hook to set start time and begin tracking time when the component mounts
  useEffect(() => {
    setStop((prev) => ({ ...prev, startTime: new Date(), endTime: null, isTiming: true }));
  }, []); // This effect also runs only once when the component mounts

  // Function to handle location selection from the LocationSearch component
  const handleLocationSelect = (name, coords) => {
    setStop((prev) => ({ ...prev, location: name, coords }));
  };

  // Function to handle change in stop type (Pickup, Dropoff, etc.)
  const handleTypeChange = (event) => {
    setStop((prev) => ({ ...prev, type: event.target.value }));
  };

  // Function to handle form submission and record the stop
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Check if location is set before allowing submission
    if (stop.location === "" || !stop.coords) {
      return window.alert(`You have to indicate the stop location before recording it`);
    }

    dispatch(toggleLoading(true)); // Dispatch loading state to Redux store

    // Prepare data for API request
    const body = {
      stop_location: { coords: stop.coords, name: stop.location },
      trip_day: currentTripDay.id, // Use the current trip day ID
      stop_type: stop.type, // Type of stop (Pickup, Dropoff, etc.)
      start_time: stop.startTime, // Start time of the stop
      end_time: new Date(), // End time of the stop
    };

    // Send a POST request to the API to record the stop
    await API.post(`/logbook/record-stop/`, body)
      .then((res) => {
        // Reset stop state after successful submission
        setStop({
          type: "",
          location: "",
          coords: null,
          startTime: null,
          endTime: null,
          isTiming: false,
        });
      })
      .catch((err) => {}) // Error handling if the API request fails
      .finally(() => {
        dispatch(toggleLoading(false)); // Dispatch loading state to Redux store (false after request completes)
        setOpenAddStop(false); // Close the modal
      });
  };

  return (
    // Render CustomModal component with the form for adding a stop
    <CustomModal isOpen={openAddStop} maxHeight="750px" maxWidth="1000px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>
          Time Your Stop Here or Search for Your Location Below: <br /> Location:{" "}
          <span style={{ fontSize: "1rem", color: "green" }}>{stop.location}</span>
        </h3>
        <div className="dialog-row">
          <span>
            {/* Dropdown for selecting stop type */}
            <label htmlFor="stopType">Stop Type</label>
            <select id="stopType" value={stop.type} onChange={handleTypeChange} required>
              <option value="">-- Select Stop Type --</option>
              {stopTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </span>
          <span>
            {/* Location search component for selecting a different location */}
            <label>
              Search Location <span className="green">(if different from above location)</span>
            </label>
            <LocationSearch value={stop.location} onSelect={handleLocationSelect} />
          </span>
        </div>

        {/* Display LocationMap if coordinates are available */}
        {stop.coords && <LocationMap tripDetails={{ currentLocation: stop }} />}

        <div className="form-buttons">
          {/* Button to close the modal */}
          <button type="button" onClick={() => setOpenAddStop(false)}>
            Close
          </button>

          {/* Submit button to continue the journey and save the stop */}
          <button type="submit" className="add-button">
            Continue The Journey
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default AddStop; // Export AddStop component
