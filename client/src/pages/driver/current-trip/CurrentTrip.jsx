import React, { useEffect, useState } from "react"; // React library and hooks (useEffect, useState)
import { useDispatch } from "react-redux"; // Redux hook to dispatch actions

import AddStop from "./components/AddStop"; // Importing component to add a stop
import ChangeStatus from "./components/ChangeStatus"; // Importing component to change the status of a trip
import Timer from "./components/Timer"; // Importing Timer component for trip tracking
import { showError } from "@/utils"; // Utility function for showing error messages
import { toggleLoading } from "@/redux/features/sharedSlice"; // Action to toggle loading state in Redux
import API from "@/utils/API"; // API utility for making HTTP requests
import moment from "moment"; // Moment.js library for formatting dates
import TripSummary from "@/components/shared/trips/TripSummary"; // Component to view the trip summary
import ActualRouteMap from "@/components/shared/trips/ActualRouteMap";
import PlannedRouteMap from "@/components/shared/trips/PlannedRouteMap";
import RecordMileageToday from "./components/RecordMileageToday";

const CurrentTrip = () => {
  const dispatch = useDispatch(); // Initialize dispatch to interact with Redux store

  // State hooks to manage various UI states and data
  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentLogbookItem, setCurrentLogbookItem] = useState(null);
  const [currentDriverLogbook, setCurrentDriverLogbook] = useState(null);

  const [openAddStop, setOpenAddStop] = useState(false);
  const [openChangeStatus, setOpenChangeStatus] = useState(false);
  const [openTripSummary, setOpenTripSummary] = useState(false);
  const [openPlannedRouteMap, setOpenPlannedRouteMap] = useState(false);
  const [openActualRouteMap, setOpenActualRouteMap] = useState(false);

  const [openRecordMileageToday, setOpenRecordMileageToday] = useState(false);

  // useEffect hook to fetch current trip data on component mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Set loading state to true
      await API.get(`/logbook/get-current-trip/`) // API request to fetch current trip data
        .then((res) => {
          // If the data is received, set the trip-related state variables
          setCurrentTrip(res?.data?.current_trip_data);
          setCurrentDriverLogbook(res?.data?.driver_logbook_data);
          setCurrentLogbookItem(res?.data?.current_logbook_item_data);
        })
        .catch((err) => showError(err)) // If error, show the error message
        .finally(() => dispatch(toggleLoading(false))); // Set loading state to false after request completion
    };
    fetchData(); // Call fetchData on component mount
  }, [dispatch]); // Dependency array ensures fetchData runs only once

  // Function to handle ending the trip
  const handleEndTrip = async () => {
    // If no trip day, prompt user for confirmation to end the trip
    if (window.confirm("Are you sure you want to end this trip?")) {
      dispatch(toggleLoading(true)); // Set loading state to true
      await API.post(`/logbook/driver-end-trip/`, {
        // API request to end the trip
        tripId: currentTrip?.id,
      })
        .then((res) => {
          // Reset current trip data on success
          setCurrentTrip(null);
          window.alert(res?.data?.message); // Show success message
        })
        .catch((err) => showError(err)) // Show error message on failure
        .finally(() => dispatch(toggleLoading(false))); // Set loading state to false
    }
  };

  return (
    <>
      <div className="current-trip">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", marginBottom: "1rem" }}>
          <>
            <h4 className="tc">
              My Current Status: <span className="green">{currentLogbookItem?.item_type_name || <span className="red">Not Set</span>}</span>
            </h4>
            <Timer startTime={currentLogbookItem?.start_time} />
          </>

          <button typ="button" className="add-button" onClick={() => setOpenChangeStatus(true)}>
            {currentLogbookItem?.item_type_name ? "Change Status" : "Set Status"}
          </button>
          <button className="add-button" onClick={() => setOpenRecordMileageToday(true)}>
            Record Miles Covered Today
          </button>
        </div>
        <h3>CURRENT TRIP</h3>
        {currentTrip ? ( // If current trip exists, show the trip details in a table
          <table className="table-listing-item" rules="all" border="1">
            <tbody>
              <tr className="table-listing-header">
                <th>Date</th>
                <th>Pickup Location</th>
                <th>Dropoff Location</th>
                <th>Planned Route Map</th>
                <th>Route Map So Far</th>
                <th>Add Stop</th>
                <th>Trip Summary</th>
                <th>End Trip</th>
              </tr>
              <tr>
                <td data-label="Date">{moment(currentTrip?.trip_start_date).format("LL")}</td> {/* Format trip start date */}
                <td data-label="Pickup Location">{currentTrip?.pickup_location?.name}</td> {/* Display pickup location */}
                <td data-label="Dropoff Location">{currentTrip?.dropoff_location?.name}</td> {/* Display dropoff location */}
                <td className="button-span" onClick={() => setOpenPlannedRouteMap(true)}>
                  Planned Route Map
                </td>
                <td className="button-span" onClick={() => setOpenActualRouteMap(true)}>
                  View Route So Far
                </td>
                <td className="button-span" data-label="Trip Stop">
                  <span onClick={() => setOpenAddStop(true)}>Add Stop</span>
                </td>
                <td className="button-span" onClick={() => setOpenTripSummary(true)} data-label="Summary">
                  Trip Summary
                </td>
                <td className="button-span" onClick={() => handleEndTrip()}>
                  End Trip
                </td>
              </tr>{" "}
            </tbody>
          </table>
        ) : (
          <h4 className="not-available">You do not have an active current trip</h4>
        )}
      </div>

      {/* Modals for various actions */}

      {openAddStop && <AddStop openAddStop={openAddStop} setOpenAddStop={setOpenAddStop} currentTripId={currentTrip?.id} />}
      {openChangeStatus && (
        <ChangeStatus
          openChangeStatus={openChangeStatus}
          setOpenChangeStatus={setOpenChangeStatus}
          currentLogbookItem={currentLogbookItem}
          setCurrentLogbookItem={setCurrentLogbookItem}
          setCurrentDriverLogbook={setCurrentDriverLogbook}
        />
      )}

      {openTripSummary && (
        <TripSummary openTripSummary={openTripSummary} setOpenTripSummary={setOpenTripSummary} selectedTripId={currentTrip?.id} />
      )}

      {openPlannedRouteMap && (
        <PlannedRouteMap
          openPlannedRouteMap={openPlannedRouteMap}
          setOpenPlannedRouteMap={setOpenPlannedRouteMap}
          currentTrip={currentTrip}
        />
      )}
      {openActualRouteMap && (
        <ActualRouteMap
          openActualRouteMap={openActualRouteMap}
          setOpenActualRouteMap={setOpenActualRouteMap}
          selectedTripId={currentTrip?.id}
        />
      )}
      {openRecordMileageToday && (
        <RecordMileageToday
          openRecordMileageToday={openRecordMileageToday}
          setOpenRecordMileageToday={setOpenRecordMileageToday}
          currentDriverLogbookId={currentDriverLogbook?.id}
        />
      )}
    </>
  );
};

export default CurrentTrip;
