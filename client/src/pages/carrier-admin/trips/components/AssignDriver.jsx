// Import necessary components and utilities
import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

// Define the AssignDriver component
const AssignDriver = (props) => {
  const { openAssignDriver, setOpenAssignDriver, currentTrip, setTripsList } = props;

  const dispatch = useDispatch();

  // State to store available drivers, trucks, and selected driver/truck
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(""); // Selected driver
  const [tripStartDate, setTripStartDate] = useState(""); // Selected trip start date
  const [selectedTruck, setSelectedTruck] = useState(""); // Selected truck

  // useEffect hook to fetch available drivers and trucks from the API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Show loading indicator
      await API.get(`/users/get-available-carrier-drivers/`)
        .then((res) => {
          // Set the available drivers and trucks data from API response
          setAvailableDrivers(res?.data?.available_drivers_data);
          setAvailableTrucks(res?.data?.available_trucks_data);
        })
        .catch((err) => showError(err)) // Handle error if the API request fails
        .finally(() => dispatch(toggleLoading(false))); // Hide loading indicator after the request completes
    };
    fetchData();
  }, [dispatch]); // Empty dependency array ensures this runs once when the component mounts

  // Function to handle form submission for assigning a driver and truck to a trip
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    dispatch(toggleLoading(true)); // Show loading indicator while the request is processing

    // Post request to assign the driver, truck, and trip details to the backend
    await API.post(`/logbook/assign-trip-driver/`, {
      driverId: selectedDriver?.id,
      truckId: selectedTruck?.id,
      tripId: currentTrip?.id,
      tripStartDate,
    })
      .then((res) => {
        // On success, update the trip list with the updated trip data
        setTripsList((prev) => prev?.map((item) => (item?.id === res?.data?.updated_trip_data?.id ? res?.data?.updated_trip_data : item)));
        window.alert(res?.data?.message); // Show success message
        setOpenAssignDriver(false); // Close the modal after assignment
      })
      .catch((err) => showError(err)) // Handle errors during the assignment
      .finally(() => dispatch(toggleLoading(false))); // Hide loading indicator after the request completes
  };

  return (
    // Modal to assign a driver and truck for the trip
    <CustomModal isOpen={openAssignDriver} maxWidth="700px" maxHeight="600px">
      <form className="dialog">
        <h3>Assign a driver for this trip</h3>
        {/* Display pickup location (disabled input) */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Pickup Location</label>
          <input type="text" value={currentTrip?.pickup_location_name} disabled />
        </div>
        {/* Display dropoff location (disabled input) */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Dropoff Location</label>
          <input type="text" value={currentTrip?.dropoff_location_name} disabled />
        </div>

        {/* Dropdown for selecting a driver */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Select Driver</label>
          <Autocomplete
            key="available-drivers"
            value={selectedDriver?.id}
            onChange={(e, newValue) => setSelectedDriver(newValue)} // Update selected driver
            options={availableDrivers}
            getOptionLabel={(option) => (option ? `${option?.driver_number} ${option?.first_name} ${option?.last_name}` : "")} // Format driver label
            renderInput={(params) => <TextField {...params} label="" placeholder="Select" required />}
            isOptionEqualToValue={(option, value) => option?.id === value?.id} // Compare options by ID
            disablePortal
            disableClearable
          />
        </div>

        {/* Dropdown for selecting a truck */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Select Truck</label>
          <Autocomplete
            key="available-trucks"
            value={selectedTruck?.id}
            onChange={(e, newValue) => setSelectedTruck(newValue)} // Update selected truck
            options={availableTrucks}
            getOptionLabel={(option) => (option ? `${option?.truck_number} ${option?.trailer_number}` : "")} // Format truck label
            renderInput={(params) => <TextField {...params} label="" placeholder="Select" required />}
            isOptionEqualToValue={(option, value) => option?.id === value?.id} // Compare options by ID
            disablePortal
            disableClearable
          />
        </div>

        {/* Input for trip start date */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Trip Start Date</label>
          <input type="date" onChange={(e) => setTripStartDate(e.target.value)} value={tripStartDate} required />
        </div>

        {/* Buttons for closing the modal or submitting the form */}
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenAssignDriver(false)}>
            Close
          </button>
          <button type="submit" onClick={handleSubmit}>
            Assign Driver
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

// Export the AssignDriver component as default
export default AssignDriver;
