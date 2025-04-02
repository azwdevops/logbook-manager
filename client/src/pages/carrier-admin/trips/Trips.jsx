// Import necessary dependencies and components
import React, { useEffect, useState } from "react";
import moment from "moment"; // For formatting dates
import CircularProgress from "@mui/material/CircularProgress"; // For loading spinner

import API from "@/utils/API"; // Custom API utility for making requests
import { showError } from "@/utils"; // Custom utility for error handling
import { useDispatch, useSelector } from "react-redux"; // For Redux state management
import { toggleLoading } from "@/redux/features/sharedSlice"; // Action to toggle loading state
import ELDLogUI from "@/components/shared/ELDLog/ELDLogUI"; // Component to display ELD Log
import AddTrip from "./components/AddTrip"; // Component for adding a new trip
import TripSummary from "@/components/shared/trips/TripSummary"; // Component for trip summary
import RouteMap from "@/components/shared/trips/RouteMap"; // Component to view route map
import AssignDriver from "./components/AssignDriver"; // Component to assign a driver to a trip

// Functional component to handle trips management
const Trips = () => {
  // Redux state: checking if the app is loading
  const loading = useSelector((state) => state?.shared?.loading);

  // Local state to store trips list and manage selected trip
  const [tripsList, setTripsList] = useState([]); // List of trips
  const [selectedTripId, setSelectedTripId] = useState(null); // Selected trip ID for actions
  const [currentTrip, setCurrentTrip] = useState({}); // Currently selected trip details
  const [logbookIndex, setLogbookIndex] = useState(0); // Index for the logbook

  // States for managing modal visibility
  const [openELDLog, setOpenELDLog] = useState(false); // ELD log modal state
  const [openRouteMap, setOpenRouteMap] = useState(false); // Route map modal state
  const [openTripSummary, setOpenTripSummary] = useState(false); // Trip summary modal state
  const [openAddTrip, setOpenAddTrip] = useState(false); // Add trip modal state
  const [openAssignDriver, setOpenAssignDriver] = useState(false); // Assign driver modal state

  // Dispatch function for Redux actions
  const dispatch = useDispatch();

  // useEffect hook to fetch trips data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Show loading spinner
      await API.get(`/logbook/carrier-get-trips/`) // Fetch trips data
        .then((res) => {
          setTripsList(res?.data?.trips_data); // Set trips list in state
        })
        .catch((err) => {
          showError(err);
        }) // Handle any errors
        .finally(() => dispatch(toggleLoading(false))); // Hide loading spinner
    };
    fetchData(); // Call fetch function
  }, [dispatch]); // Dependency array ensures this runs on initial mount

  // Handlers to open modals with respective data
  const handleOpenELDLog = (tripId, logbookIndex) => {
    setSelectedTripId(tripId); // Set selected trip ID
    setLogbookIndex(logbookIndex); // Set logbook index
    setOpenELDLog(true); // Open ELD Log modal
  };

  const handleOpenRouteMap = (tripId) => {
    setSelectedTripId(tripId); // Set selected trip ID
    setOpenRouteMap(true); // Open Route Map modal
  };

  const handleOpenTripSummary = (tripId) => {
    setSelectedTripId(tripId); // Set selected trip ID
    setOpenTripSummary(true); // Open Trip Summary modal
  };

  const handleOpenAssignDriver = (trip) => {
    setCurrentTrip(trip); // Set current trip data
    setOpenAssignDriver(true); // Open Assign Driver modal
  };

  return (
    <div>
      {/* Display loading spinner when data is being fetched */}
      {loading && <CircularProgress size={80} style={{ position: "absolute", marginLeft: "45%", marginTop: "15%" }} />}

      <h3>Most Recent Trips</h3>
      <br />
      {/* Button to open modal for adding a new trip */}
      <div className="table-parent-buttons">
        <button type="button" className="add-button" onClick={() => setOpenAddTrip(true)}>
          New Trip
        </button>
      </div>
      <br />

      {/* Render trips table if trips exist */}
      {tripsList?.length > 0 ? (
        <table className="table-listing" rules="all" border="1">
          <thead>
            <tr className="table-listing-header">
              <th>Date</th>
              <th>Pickup Location</th>
              <th>Dropoff Location</th>
              <th>Driver</th>
              <th>Truck</th>
              <th>Status</th>
              <th>View Logbook</th>
              <th>View Route</th>
              <th>Trip Summary</th>
            </tr>
          </thead>
          <tbody>
            {/* Iterate through trips list to create table rows */}
            {tripsList?.map((trip) => (
              <tr className="table-listing-item" key={trip?.id}>
                <td>{trip?.trip_start_date ? moment(trip?.trip_start_date).format("LL") : <span className="red bd">Not Set</span>}</td>
                <td>{trip?.pickup_location_name}</td>
                <td>{trip?.dropoff_location_name}</td>
                <td>
                  {trip?.driver_name !== "" ? (
                    trip?.driver_name
                  ) : (
                    <span className="red bd">
                      Not Assigned <br /> <hr /> {/* Button to assign driver if not already assigned */}
                      <span className="button-span" onClick={() => handleOpenAssignDriver(trip)}>
                        Assign Now
                      </span>{" "}
                    </span>
                  )}
                </td>
                <td>{trip?.truck_number !== "" ? <span>{trip?.truck_number}</span> : <span className="red bd">Not Assigned</span>}</td>
                <td>{trip?.is_done ? <span className="green bd">Completed</span> : <span className="red bd">Ongoing</span>}</td>
                <td className="button-span">
                  {trip?.logbook_count > 0 ? (
                    <>
                      {/* Display logbooks associated with trip */}
                      {Array.from({ length: trip?.logbook_count })?.map((_, index) => (
                        <>
                          <span onClick={() => handleOpenELDLog(trip?.id, index)} style={{ margin: "0.5rem 0", display: "block" }}>
                            Logbook {index + 1}
                          </span>
                          <hr />
                        </>
                      ))}
                    </>
                  ) : (
                    <span className="red bd">No logbooks yet</span>
                  )}
                </td>
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
        // Message when no trips are available
        <h4 className="not-available">No trips created yet</h4>
      )}

      {/* Modal for viewing ELD Log */}
      {openELDLog && (
        <ELDLogUI openELDLog={openELDLog} setOpenELDLog={setOpenELDLog} selectedTripId={selectedTripId} logbookIndex={logbookIndex} />
      )}

      {/* Modal for viewing Route Map */}
      {openRouteMap && <RouteMap openRouteMap={openRouteMap} setOpenRouteMap={setOpenRouteMap} selectedTripId={selectedTripId} />}

      {/* Modal for viewing Trip Summary */}
      {openTripSummary && (
        <TripSummary openTripSummary={openTripSummary} setOpenTripSummary={setOpenTripSummary} selectedTripId={selectedTripId} />
      )}

      {/* Modal for adding a new trip */}
      {openAddTrip && (
        <AddTrip openAddTrip={openAddTrip} setOpenAddTrip={setOpenAddTrip} tripsList={tripsList} setTripsList={setTripsList} />
      )}

      {/* Modal for assigning a driver */}
      {openAssignDriver && (
        <AssignDriver
          openAssignDriver={openAssignDriver}
          setOpenAssignDriver={setOpenAssignDriver}
          currentTrip={currentTrip}
          setTripsList={setTripsList}
        />
      )}
    </div>
  );
};

// Exporting the Trips component as the default export
export default Trips;
