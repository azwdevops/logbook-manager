import React, { useEffect, useState } from "react";
import moment from "moment";
import CircularProgress from "@mui/material/CircularProgress";

import API from "@/utils/API";
import { showError } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import ELDLogUI from "@/components/shared/ELDLog/ELDLogUI";
import AddTrip from "./components/AddTrip";
import TripSummary from "@/components/shared/trips/TripSummary";
import RouteMap from "@/components/shared/trips/RouteMap";
import AssignDriver from "./components/AssignDriver";

const Trips = () => {
  const loading = useSelector((state) => state?.shared?.loading);

  const [tripsList, setTripsList] = useState([]);

  const [selectedTripId, setSelectedTripId] = useState(null);
  const [currentTrip, setCurrentTrip] = useState({});
  const [logbookIndex, setLogbookIndex] = useState(0);

  const [openELDLog, setOpenELDLog] = useState(false);

  const [openRouteMap, setOpenRouteMap] = useState(false);
  const [openTripSummary, setOpenTripSummary] = useState(false);

  const [openAddTrip, setOpenAddTrip] = useState(false);
  const [openAssignDriver, setOpenAssignDriver] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/logbook/carrier-get-trips/`)
        .then((res) => {
          setTripsList(res?.data?.trips_data);
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

  const handleOpenAssignDriver = (trip) => {
    setCurrentTrip(trip);
    setOpenAssignDriver(true);
  };

  return (
    <div>
      {loading && <CircularProgress size={80} style={{ position: "absolute", marginLeft: "45%", marginTop: "15%" }} />}

      <h3>Most Recent Trips</h3>
      <br />
      <div className="table-parent-buttons">
        <button type="button" className="add-button" onClick={() => setOpenAddTrip(true)}>
          New Trip
        </button>
      </div>
      <br />

      {tripsList?.length > 0 ? (
        <table className="table-listing" rules="all" border="1">
          <thead>
            <tr className="table-listing-header">
              <th>Date</th>
              <th>Pickup Location</th>
              <th>Dropoff Location</th>
              <th>Driver</th>
              <th>Truck</th>
              <th>View Logbook</th>
              <th>View Route</th>
              <th>Trip Summary</th>
            </tr>
          </thead>
          <tbody>
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
                      Not Assigned <br /> <hr />{" "}
                      <span className="button-span" onClick={() => handleOpenAssignDriver(trip)}>
                        Assign Now
                      </span>{" "}
                    </span>
                  )}
                </td>
                <td>{trip?.truck_number !== "" ? <span>{trip?.truck_number}</span> : <span className="red bd">Not Assigned</span>}</td>
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
        <h4 className="not-available">No trips created yet</h4>
      )}

      {openELDLog && (
        <ELDLogUI openELDLog={openELDLog} setOpenELDLog={setOpenELDLog} selectedTripId={selectedTripId} logbookIndex={logbookIndex} />
      )}

      {openRouteMap && <RouteMap openRouteMap={openRouteMap} setOpenRouteMap={setOpenRouteMap} selectedTripId={selectedTripId} />}

      {openTripSummary && (
        <TripSummary openTripSummary={openTripSummary} setOpenTripSummary={setOpenTripSummary} selectedTripId={selectedTripId} />
      )}

      {openAddTrip && (
        <AddTrip openAddTrip={openAddTrip} setOpenAddTrip={setOpenAddTrip} tripsList={tripsList} setTripsList={setTripsList} />
      )}
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

export default Trips;
