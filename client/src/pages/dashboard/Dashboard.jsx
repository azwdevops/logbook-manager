import React, { useEffect, useState } from "react";
import moment from "moment";
import CircularProgress from "@mui/material/CircularProgress";

import TripInputForm from "./components/TripInputForm";
import API from "@/utils/API";
import { showError } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";

import AddStop from "./components/AddStop";
import ChangeStatus from "./components/ChangeStatus";
import Timer from "./components/Timer";
import "./Dashboard.css";
import ELDLogUI from "./ELDLog/ELDLogUI";

const Dashboard = () => {
  const loading = useSelector((state) => state?.shared?.loading);

  const [openTripInputForm, setOpenTripInputForm] = useState(false);
  const [recentTrips, setRecentTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentTripDay, setCurrentTripDay] = useState(null);
  const [currentTripItem, setCurrentTripItem] = useState(null);
  const [openAddStop, setOpenAddStop] = useState(false);
  const [openChangeStatus, setOpenChangeStatus] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const [openELDLog, setOpenELDLog] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/logbook/get-trips/`)
        .then((res) => {
          setRecentTrips(res?.data?.trips_data);
          if (res?.data?.current_trip_data) {
            setCurrentTrip(res?.data?.current_trip_data);
            setCurrentTripDay(res?.data?.current_trip_day);
            setCurrentTripItem(res?.data?.current_trip_data?.current_trip_item);
          }
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch]);

  const handleEndTrip = async () => {
    if (window.confirm("Are you sure you want to end this trip?")) {
      dispatch(toggleLoading(true));
      await API.post(`/logbook/end-trip/`, {
        tripId: currentTrip?.id,
        current_trip_item: currentTripItem,
        trip_end_date: new Date().toISOString().split("T")[0],
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

  const handleOpenELDLog = (tripId) => {
    setSelectedTripId(tripId);
    setOpenELDLog(true);
  };

  return (
    <div className={`dashboard ${loading && "page-loading"}`}>
      {loading && <CircularProgress size={80} style={{ position: "absolute", marginLeft: "45%", marginTop: "15%" }} />}
      <div className="current-trip">
        <h3>CURRENT TRIP</h3>
        {currentTrip && (
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1rem" }}>
            <h4 className="tc">
              Trip Status: <span className="green">{currentTripItem?.trip_item_name || <span className="red">Not Set</span>}</span>
            </h4>
            <Timer startTime={currentTripItem?.start_time} />
          </div>
        )}
        {currentTrip ? (
          <table className="table-listing-item" rules="all" border="1">
            <tbody>
              <tr className="table-listing-header">
                <th>Date</th>
                <th>Pickup Location</th>
                <th>Dropoff Location</th>
                <th>Add Stop</th>
                <th>Trip Status</th>
                <th>End Trip</th>
              </tr>
              <tr>
                <td>{moment(currentTrip?.trip_start_date).format("LL")}</td>
                <td>{currentTrip?.pickup_location_name}</td>
                <td>{currentTrip?.dropoff_location_name}</td>
                <td className="button-span" onClick={() => setOpenAddStop(true)}>
                  Add Stop
                </td>
                <td className="trip-status">
                  {currentTripItem?.trip_item_name ? (
                    <span>{currentTripItem?.trip_item_name}</span>
                  ) : (
                    <span className="red bd">Not Set</span>
                  )}
                  <hr />
                  <span className="button-span" onClick={() => setOpenChangeStatus(true)}>
                    Change Status
                  </span>
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
        {!currentTrip && (
          <div style={{ textAlign: "center" }}>
            <button type="button" className="add-button" onClick={() => setOpenTripInputForm(true)}>
              New Trip
            </button>
          </div>
        )}
      </div>
      <hr />
      <div className="recent-trips">
        <h3>Most Recent Trips</h3>
        {recentTrips?.length > 0 ? (
          <table className="table-listing" rules="all" border="1">
            <thead>
              <tr className="table-listing-header">
                <th>Date</th>
                <th>Pickup Location</th>
                <th>Dropoff Location</th>
                <th>View Logbook</th>
                <th>View Route</th>
                <th>Trip Summary</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips?.map((trip) => (
                <tr className="table-listing-item" key={trip?.id}>
                  <td>{moment(trip?.trip_start_date).format("LL")}</td>
                  <td>{trip?.pickup_location_name}</td>
                  <td>{trip?.dropoff_location_name}</td>
                  <td className="button-span">
                    {Array.from({ length: trip.logbook_count })?.map((_, index) => (
                      <span onClick={() => handleOpenELDLog(trip?.id)}>View Logbook</span>
                    ))}
                  </td>
                  <td className="button-span">View Route</td>
                  <td className="button-span">Trip Summary</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h4 className="not-available">No recent trips made yet</h4>
        )}
      </div>
      {openTripInputForm && (
        <TripInputForm openTripInputForm={openTripInputForm} setOpenTripInputForm={setOpenTripInputForm} setCurrentTrip={setCurrentTrip} />
      )}
      {openAddStop && <AddStop openAddStop={openAddStop} setOpenAddStop={setOpenAddStop} currentTrip={currentTrip} />}
      {openChangeStatus && (
        <ChangeStatus
          openChangeStatus={openChangeStatus}
          setOpenChangeStatus={setOpenChangeStatus}
          currentTripDay={currentTripDay}
          currentTripItem={currentTripItem}
          setCurrentTripItem={setCurrentTripItem}
        />
      )}
      {openELDLog && <ELDLogUI openELDLog={openELDLog} setOpenELDLog={setOpenELDLog} selectedTripId={selectedTripId} />}
    </div>
  );
};

export default Dashboard;
