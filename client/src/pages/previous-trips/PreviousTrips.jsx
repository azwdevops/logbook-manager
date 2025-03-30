import React, { useEffect, useState } from "react";
import moment from "moment";
import CircularProgress from "@mui/material/CircularProgress";

import API from "@/utils/API";
import { showError } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";

import "./PreviousTrips.css";
import ELDLogUI from "./ELDLog/ELDLogUI";

import RouteMap from "./components/RouteMap";
import TripSummary from "./components/TripSummary";

const PreviousTrips = () => {
  const loading = useSelector((state) => state?.shared?.loading);

  const [recentTrips, setRecentTrips] = useState([]);

  const [selectedTripId, setSelectedTripId] = useState(null);
  const [logbookIndex, setLogbookIndex] = useState(0);

  const [openELDLog, setOpenELDLog] = useState(false);

  const [openRouteMap, setOpenRouteMap] = useState(false);
  const [openTripSummary, setOpenTripSummary] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/logbook/get-trips/`)
        .then((res) => {
          setRecentTrips(res?.data?.trips_data);
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch]);

  const handleOpenELDLog = (tripId, logbookIndex) => {
    setSelectedTripId(tripId);
    setLogbookIndex(logbookIndex);
    setOpenELDLog(true);
  };

  const handleOpenRouteMap = (tripId) => {
    setSelectedTripId(tripId);
    setOpenRouteMap(true);
  };

  const handleOpenTripSummary = (tripId) => {
    setSelectedTripId(tripId);
    setOpenTripSummary(true);
  };

  return (
    <div className={`dashboard ${loading && "page-loading"}`}>
      {loading && <CircularProgress size={80} style={{ position: "absolute", marginLeft: "45%", marginTop: "15%" }} />}

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
                    {Array.from({ length: trip?.logbook_count })?.map((_, index) => (
                      <>
                        <span onClick={() => handleOpenELDLog(trip?.id, index)} style={{ margin: "0.5rem 0", display: "block" }}>
                          Logbook {index + 1}
                        </span>
                        <hr />
                      </>
                    ))}
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
          <h4 className="not-available">No recent trips made yet</h4>
        )}
      </div>

      {openELDLog && (
        <ELDLogUI openELDLog={openELDLog} setOpenELDLog={setOpenELDLog} selectedTripId={selectedTripId} logbookIndex={logbookIndex} />
      )}

      {openRouteMap && <RouteMap openRouteMap={openRouteMap} setOpenRouteMap={setOpenRouteMap} selectedTripId={selectedTripId} />}

      {openTripSummary && (
        <TripSummary openTripSummary={openTripSummary} setOpenTripSummary={setOpenTripSummary} selectedTripId={selectedTripId} />
      )}
    </div>
  );
};

export default PreviousTrips;
