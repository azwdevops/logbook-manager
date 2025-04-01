import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import CloseTripDay from "./components/CloseTripDay";
import StartTripDay from "./components/StartTripDay";
import EndTripAndCloseTripDay from "./components/EndTripAndCloseTripDay";
import AddStop from "./components/AddStop";
import ChangeStatus from "./components/ChangeStatus";
import Timer from "./components/Timer";
import { showError } from "@/utils";
import { toggleLoading } from "@/redux/features/sharedSlice";
import API from "@/utils/API";
import moment from "moment";
import CurrentTripRouteMap from "./components/CurrentTripRouteMap";
import TripSummary from "@/components/shared/trips/TripSummary";

const CurrentTrip = () => {
  const dispatch = useDispatch();

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

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/logbook/get-current-trip/`)
        .then((res) => {
          if (res?.data?.current_trip_data) {
            setCurrentTrip(res?.data?.current_trip_data);
            setCurrentTripDay(res?.data?.current_trip_data?.current_trip_day);
            setCurrentTripItem(res?.data?.current_trip_data?.current_trip_item);
          }
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch]);

  const handleEndTrip = async () => {
    if (currentTripDay) {
      setOpenEndTripAndCloseTripDay(true);
      return;
    }
    if (window.confirm("Are you sure you want to end this trip?")) {
      dispatch(toggleLoading(true));
      await API.post(`/logbook/end-trip/`, {
        tripId: currentTrip?.id,
        current_trip_item_id: currentTripItem?.id,
        close_trip_day: false,
      })
        .then((res) => {
          setCurrentTrip(null);
          setCurrentTripItem(null);
          window.alert(res?.data?.message);
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    }
  };

  return (
    <>
      <div className="current-trip">
        <h3>CURRENT TRIP</h3>
        {currentTrip && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", marginBottom: "1rem" }}>
            {currentTripDay && (
              <>
                <h4 className="tc">
                  Trip Status: <span className="green">{currentTripItem?.trip_item_name || <span className="red">Not Set</span>}</span>
                </h4>
                <Timer startTime={currentTripItem?.start_time} />
              </>
            )}
            {currentTripDay && (
              <button typ="button" className="add-button" onClick={() => setOpenCloseTripDay(true)}>
                Close The Day
              </button>
            )}
            {!currentTripDay && (
              <>
                <span className="green bd">Click on start the day to start tracking trip activities</span>
                <button typ="button" className="add-button" onClick={() => setOpenStartTripDay(true)}>
                  Start The Day
                </button>
              </>
            )}
          </div>
        )}
        {currentTrip ? (
          <table className="table-listing-item" rules="all" border="1">
            <tbody>
              <tr className="table-listing-header">
                <th>Date</th>
                <th>Pickup Location</th>
                <th>Dropoff Location</th>
                <th>View Route Map</th>
                <th>Add Stop</th>
                <th>Trip Status</th>
                <th>Trip Summary</th>
                <th>End Trip</th>
              </tr>
              <tr>
                <td data-label="Date">{moment(currentTrip?.trip_start_date).format("LL")}</td>
                <td data-label="Pickup Location">{currentTrip?.pickup_location?.name}</td>
                <td data-label="Dropoff Location">{currentTrip?.dropoff_location?.name}</td>
                <td className="button-span" onClick={() => setOpenCurrentTripRouteMap(true)}>
                  View Route Map
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
    </>
  );
};

export default CurrentTrip;
