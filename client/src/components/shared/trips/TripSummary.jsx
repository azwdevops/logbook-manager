// Import necessary dependencies and components
import React, { useEffect, useState } from "react";
import moment from "moment"; // For date and time formatting
import CustomModal from "@/components/shared/CustomModal"; // Custom modal component
import { toggleLoading } from "@/redux/features/sharedSlice"; // Action to toggle loading state
import { showError } from "@/utils"; // Utility function to show error
import API from "@/utils/API"; // API utility for making requests
import { useDispatch } from "react-redux"; // Hook for dispatching actions to Redux store

// TripSummary component to display summary of a selected trip
const TripSummary = (props) => {
  // Extracting props passed to the component
  const { openTripSummary, setOpenTripSummary, selectedTripId } = props;

  // State to store the trip summary data
  const [tripSummaryData, setTripSummaryData] = useState({});

  // Dispatch hook to dispatch Redux actions
  const dispatch = useDispatch();

  // useEffect hook to fetch trip summary data on component mount or selectedTripId change
  useEffect(() => {
    // Asynchronous function to fetch data from API
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Dispatch action to show loading state
      await API.get(`/logbook/get-trip-summary/${selectedTripId}/`) // API request to fetch trip summary data
        .then((res) => {
          // Set the retrieved trip summary data in state
          setTripSummaryData(res?.data?.trip_summary_data);
        })
        .catch((err) => showError(err)) // Show error if request fails
        .finally(() => dispatch(toggleLoading(false))); // Dispatch action to hide loading state once the request is complete
    };

    fetchData(); // Call fetchData function
  }, [dispatch, selectedTripId]); // Dependencies: dispatch and selectedTripId, re-run when they change

  return (
    // Render the modal with trip summary content
    <CustomModal isOpen={openTripSummary} maxWidth="1000px" maxHeight="700px">
      <div className="dialog">
        <h3>Trip Summary</h3>
        {/* Table displaying general trip summary data */}
        <table rules="all" border="1">
          <thead>
            <tr>
              <th>Starting Location</th>
              <th>Pickup Location</th>
              <th>Dropoff Location</th>
              <th>Cycle Used</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{tripSummaryData?.starting_location_name}</td>
              <td>{tripSummaryData?.pickup_location_name}</td>
              <td>{tripSummaryData?.dropoff_location_name}</td>
              <td>{tripSummaryData?.cycle_used}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <h3>Stop Locations</h3>
        {/* Table displaying the stop locations for the trip */}
        <table rules="all" border="1">
          <thead>
            <tr>
              <th>Stop Location Name</th>
              <th>Remarks</th>
              <th>Arrival</th>
              <th>Departure</th>
            </tr>
          </thead>
          <tbody>
            {/* Loop through stop locations and display each stop's details */}
            {tripSummaryData?.stops?.map((stopItem) => (
              <tr key={stopItem?.id}>
                <td>{stopItem?.stop_location["name"]}</td>
                <td>{stopItem?.stop_type}</td>
                <td>{moment(stopItem?.start_time).format("LLL")}</td>
                <td>{moment(stopItem?.end_time).format("LLL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Button to close the trip summary modal */}
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenTripSummary(false)}>
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

// Export the TripSummary component for use in other parts of the application
export default TripSummary;
