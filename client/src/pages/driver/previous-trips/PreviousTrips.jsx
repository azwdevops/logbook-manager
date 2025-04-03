import React, { useEffect, useState } from "react";
import moment from "moment"; // Importing moment.js for date formatting
import CircularProgress from "@mui/material/CircularProgress"; // Importing Material UI CircularProgress for loading indicator

import API from "@/utils/API"; // Custom API utility for making requests
import { showError } from "@/utils"; // Utility for showing errors
import { useDispatch, useSelector } from "react-redux"; // Redux hooks for state management
import { toggleLoading } from "@/redux/features/sharedSlice"; // Redux action to toggle loading state

import ELDLogUI from "@/components/shared/ELDLog/ELDLogUI"; // Component to display ELD logbook UI
import "./PreviousTrips.css"; // Custom styles for the component
import ActualRouteMap from "@/components/shared/trips/ActualRouteMap"; // Component to display route map
import TripSummary from "@/components/shared/trips/TripSummary"; // Component to display trip summary

const PreviousTrips = () => {
  // Selector for accessing global loading state from Redux store
  const loading = useSelector((state) => state?.shared?.loading);

  // Local state for storing recent trips data
  const [recentTrips, setRecentTrips] = useState([]);

  // Local state for storing selected trip ID and logbook index
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [logbookIndex, setLogbookIndex] = useState(0);

  // States for controlling the visibility of different UI components
  const [openELDLog, setOpenELDLog] = useState(false);
  const [openActualRouteMap, setOpenActualRouteMap] = useState(false);
  const [openTripSummary, setOpenTripSummary] = useState(false);

  // Dispatch function to dispatch Redux actions
  const dispatch = useDispatch();

  // Effect hook to fetch recent trips data on component mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Show loading spinner
      await API.get(`/logbook/driver-get-trips/`) // Make API call to fetch trips
        .then((res) => {
          setRecentTrips(res?.data?.trips_data); // Set trips data to state
        })
        .catch((err) => showError(err)) // Handle errors
        .finally(() => dispatch(toggleLoading(false))); // Hide loading spinner
    };
    fetchData();
  }, [dispatch]); // Empty dependency array ensures this effect runs only once on mount

  // Handler for opening ELD logbook UI when a trip is clicked
  const handleOpenELDLog = (tripId, logbookIndex) => {
    setSelectedTripId(tripId); // Set selected trip ID
    setLogbookIndex(logbookIndex); // Set selected logbook index
    setOpenELDLog(true); // Open ELD logbook UI
  };

  // Handler for opening route map when a trip is clicked
  const handleOpenRouteMap = (tripId) => {
    setSelectedTripId(tripId); // Set selected trip ID
    setOpenActualRouteMap(true); // Open route map UI
  };

  // Handler for opening trip summary when a trip is clicked
  const handleOpenTripSummary = (tripId) => {
    setSelectedTripId(tripId); // Set selected trip ID
    setOpenTripSummary(true); // Open trip summary UI
  };

  return (
    <div className={`dashboard ${loading && "page-loading"}`}>
      {/* Show loading spinner while data is being fetched */}
      {loading && <CircularProgress size={80} style={{ position: "absolute", marginLeft: "45%", marginTop: "15%" }} />}

      <div className="recent-trips">
        <h3>Most Recent Trips</h3>
        {/* Display trips table if recent trips data is available */}
        {recentTrips?.length > 0 ? (
          <table className="table-listing" rules="all" border="1">
            <thead>
              <tr className="table-listing-header">
                <th>Date</th>
                <th>Pickup Location</th>
                <th>Dropoff Location</th>
                <th>View Route</th>
                <th>Trip Summary</th>
              </tr>
            </thead>
            <tbody>
              {/* Loop through recent trips and render each trip */}
              {recentTrips?.map((trip) => (
                <tr className="table-listing-item" key={trip?.id}>
                  <td data-label="Start Date">{moment(trip?.trip_start_date).format("LL")}</td> {/* Format trip start date */}
                  <td data-label="Pickup Location">{trip?.pickup_location_name}</td>
                  <td data-label="Dropoff Location">{trip?.dropoff_location_name}</td>
                  <td className="button-span" onClick={() => handleOpenRouteMap(trip?.id)}>
                    View Route
                  </td>
                  <td className="button-span" onClick={() => handleOpenTripSummary(trip?.id)}>
                    Trip Summary
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h4 className="not-available">No recent trips made yet</h4> // Display message when no trips are available
        )}
      </div>

      {/* Conditionally render ELDLogUI, ActualRouteMap, and TripSummary components based on state */}
      {openELDLog && (
        <ELDLogUI openELDLog={openELDLog} setOpenELDLog={setOpenELDLog} selectedTripId={selectedTripId} logbookIndex={logbookIndex} />
      )}

      {openActualRouteMap && (
        <ActualRouteMap
          openActualRouteMap={openActualRouteMap}
          setOpenActualRouteMap={setOpenActualRouteMap}
          selectedTripId={selectedTripId}
        />
      )}

      {openTripSummary && (
        <TripSummary openTripSummary={openTripSummary} setOpenTripSummary={setOpenTripSummary} selectedTripId={selectedTripId} />
      )}
    </div>
  );
};

export default PreviousTrips; // Export the component as default
