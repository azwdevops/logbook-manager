import React, { useEffect, useState } from "react"; // React library and hooks (useEffect, useState)
import { useDispatch } from "react-redux"; // Redux hook to dispatch actions

import CloseTripDay from "./components/CloseTripDay"; // Importing component for closing a trip day
import StartTripDay from "./components/StartTripDay"; // Importing component to start a trip day
import EndTripAndCloseTripDay from "./components/EndTripAndCloseTripDay"; // Importing component to end and close a trip day
import AddStop from "./components/AddStop"; // Importing component to add a stop
import ChangeStatus from "./components/ChangeStatus"; // Importing component to change the status of a trip
import Timer from "./components/Timer"; // Importing Timer component for trip tracking
import { showError } from "@/utils"; // Utility function for showing error messages
import { toggleLoading } from "@/redux/features/sharedSlice"; // Action to toggle loading state in Redux
import API from "@/utils/API"; // API utility for making HTTP requests
import moment from "moment"; // Moment.js library for formatting dates
import CurrentTripRouteMap from "./components/CurrentTripRouteMap"; // Component to view the current trip route map
import TripSummary from "@/components/shared/trips/TripSummary"; // Component to view the trip summary
import RouteMap from "@/components/shared/trips/RouteMap";
import ELDLogUI from "@/components/shared/ELDLog/ELDLogUI";

const CurrentTrip = () => {
  const dispatch = useDispatch(); // Initialize dispatch to interact with Redux store

  // State hooks to manage various UI states and data
  const [openCloseTripDay, setOpenCloseTripDay] = useState(false);
  const [openStartTripDay, setOpenStartTripDay] = useState(false);
  const [openEndTripAndCloseTripDay, setOpenEndTripAndCloseTripDay] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentTripDay, setCurrentTripDay] = useState(null);
  const [currentTripItem, setCurrentTripItem] = useState(null);

  const [openAddStop, setOpenAddStop] = useState(false);
  const [openChangeStatus, setOpenChangeStatus] = useState(false);
  const [openTripSummary, setOpenTripSummary] = useState(false);
  const [openCurrentTripRouteMap, setOpenCurrentTripRouteMap] = useState(false);
  const [openRouteMap, setOpenRouteMap] = useState(false);

  const [logbookIndex, setLogbookIndex] = useState(0);

  // States for controlling the visibility of different UI components
  const [openELDLog, setOpenELDLog] = useState(false);

  // useEffect hook to fetch current trip data on component mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Set loading state to true
      await API.get(`/logbook/get-current-trip/`) // API request to fetch current trip data
        .then((res) => {
          // If the data is received, set the trip-related state variables
          if (res?.data?.current_trip_data) {
            setCurrentTrip(res?.data?.current_trip_data);
            setCurrentTripDay(res?.data?.current_trip_data?.current_trip_day);
            setCurrentTripItem(res?.data?.current_trip_data?.current_trip_item);
          }
        })
        .catch((err) => showError(err)) // If error, show the error message
        .finally(() => dispatch(toggleLoading(false))); // Set loading state to false after request completion
    };
    fetchData(); // Call fetchData on component mount
  }, [dispatch]); // Dependency array ensures fetchData runs only once

  // Function to handle ending the trip
  const handleEndTrip = async () => {
    if (currentTripDay) {
      // If current trip day exists, open the close trip day modal
      setOpenEndTripAndCloseTripDay(true);
      return;
    }
    // If no trip day, prompt user for confirmation to end the trip
    if (window.confirm("Are you sure you want to end this trip?")) {
      dispatch(toggleLoading(true)); // Set loading state to true
      await API.post(`/logbook/end-trip/`, {
        // API request to end the trip
        tripId: currentTrip?.id,
        current_trip_item_id: currentTripItem?.id,
        close_trip_day: false,
      })
        .then((res) => {
          // Reset current trip data on success
          setCurrentTrip(null);
          setCurrentTripItem(null);
          window.alert(res?.data?.message); // Show success message
        })
        .catch((err) => showError(err)) // Show error message on failure
        .finally(() => dispatch(toggleLoading(false))); // Set loading state to false
    }
  };

  // Handler for opening ELD logbook UI when a trip is clicked
  const handleOpenELDLog = (logbookIndex) => {
    setLogbookIndex(logbookIndex); // Set selected logbook index
    setOpenELDLog(true); // Open ELD logbook UI
  };

  return (
    <>
      <div className="current-trip">
        <h3>CURRENT TRIP</h3>
        {currentTrip && ( // If there is a current trip, display the trip details
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", marginBottom: "1rem" }}>
            {currentTripDay && ( // If there is a current trip day, show trip status and timer
              <>
                <h4 className="tc">
                  Trip Status: <span className="green">{currentTripItem?.trip_item_name || <span className="red">Not Set</span>}</span>
                </h4>
                <Timer startTime={currentTripItem?.start_time} />
              </>
            )}
            {currentTripDay && ( // If there is a trip day, allow user to close the trip day
              <button typ="button" className="add-button" onClick={() => setOpenCloseTripDay(true)}>
                Close The Day
              </button>
            )}
            {!currentTripDay && ( // If no trip day exists, prompt user to start the trip day
              <>
                <span className="green bd">Click on start the day to start tracking trip activities</span>
                <button typ="button" className="add-button" onClick={() => setOpenStartTripDay(true)}>
                  Start The Day
                </button>
              </>
            )}
          </div>
        )}
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
                <th>Trip Status</th>
                <th>Trip Summary</th>
                <th>Logbooks</th>
                <th>End Trip</th>
              </tr>
              <tr>
                <td data-label="Date">{moment(currentTrip?.trip_start_date).format("LL")}</td> {/* Format trip start date */}
                <td data-label="Pickup Location">{currentTrip?.pickup_location?.name}</td> {/* Display pickup location */}
                <td data-label="Dropoff Location">{currentTrip?.dropoff_location?.name}</td> {/* Display dropoff location */}
                <td className="button-span" onClick={() => setOpenCurrentTripRouteMap(true)}>
                  Planned Route Map
                </td>
                <td className="button-span" onClick={() => setOpenRouteMap(true)}>
                  View Route So Far
                </td>
                <td className="button-span" data-label="Trip Stop">
                  {currentTripDay ? <span onClick={() => setOpenAddStop(true)}>Add Stop</span> : <span className="red">N/A</span>}
                </td>
                <td className="trip-status" data-label="Trip Status">
                  {currentTripItem?.trip_item_name ? (
                    <span className="green bd">{currentTripItem?.trip_item_name}</span>
                  ) : (
                    <span className="red bd">Not Set</span>
                  )}
                  <hr />
                  {currentTripDay ? (
                    <span className="button-span" onClick={() => setOpenChangeStatus(true)}>
                      Change Status
                    </span>
                  ) : (
                    <span className="red bd">N/A</span>
                  )}
                </td>
                <td className="button-span" onClick={() => setOpenTripSummary(true)} data-label="Summary">
                  Trip Summary
                </td>
                <td className="button-span" data-label="Logbooks">
                  {/* Display logbooks for each trip if available */}
                  {Array.from({ length: currentTrip?.logbook_count })?.map((_, index) => (
                    <>
                      <span onClick={() => handleOpenELDLog(index)} style={{ margin: "0.5rem 0", display: "block" }}>
                        Logbook {index + 1}
                      </span>
                      <hr />
                    </>
                  ))}
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
      {openStartTripDay && (
        <StartTripDay
          openStartTripDay={openStartTripDay}
          setOpenStartTripDay={setOpenStartTripDay}
          currentTripId={currentTrip?.id}
          setCurrentTripDay={setCurrentTripDay}
          setCurrentTripItem={setCurrentTripItem}
        />
      )}
      {openEndTripAndCloseTripDay && (
        <EndTripAndCloseTripDay
          openEndTripAndCloseTripDay={openEndTripAndCloseTripDay}
          setOpenEndTripAndCloseTripDay={setOpenEndTripAndCloseTripDay}
          currentTripId={currentTrip?.id}
          currentTripItemId={currentTripItem?.id}
          setCurrentTrip={setCurrentTrip}
          setCurrentTripItem={setCurrentTripItem}
          currentTripDayId={currentTripDay?.id}
        />
      )}

      {openCloseTripDay && (
        <CloseTripDay
          openCloseTripDay={openCloseTripDay}
          setOpenCloseTripDay={setOpenCloseTripDay}
          currentTripDayId={currentTripDay?.id}
          currentTripItemId={currentTripItem?.id}
          setCurrentTripDay={setCurrentTripDay}
          setCurrentTripItem={setCurrentTripItem}
        />
      )}

      {openAddStop && <AddStop openAddStop={openAddStop} setOpenAddStop={setOpenAddStop} currentTripDay={currentTripDay} />}
      {openChangeStatus && (
        <ChangeStatus
          openChangeStatus={openChangeStatus}
          setOpenChangeStatus={setOpenChangeStatus}
          currentTripDay={currentTripDay}
          currentTripItem={currentTripItem}
          setCurrentTripItem={setCurrentTripItem}
        />
      )}

      {openTripSummary && (
        <TripSummary openTripSummary={openTripSummary} setOpenTripSummary={setOpenTripSummary} selectedTripId={currentTrip?.id} />
      )}

      {openCurrentTripRouteMap && (
        <CurrentTripRouteMap
          openCurrentTripRouteMap={openCurrentTripRouteMap}
          setOpenCurrentTripRouteMap={setOpenCurrentTripRouteMap}
          currentTrip={currentTrip}
        />
      )}
      {openRouteMap && <RouteMap openRouteMap={openRouteMap} setOpenRouteMap={setOpenRouteMap} selectedTripId={currentTrip?.id} />}

      {openELDLog && (
        <ELDLogUI openELDLog={openELDLog} setOpenELDLog={setOpenELDLog} selectedTripId={currentTrip?.id} logbookIndex={logbookIndex} />
      )}
    </>
  );
};

export default CurrentTrip;
