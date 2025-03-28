import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import CustomModal from "@/components/shared/CustomModal";
import LocationSearch from "./LocationSearch";
import LocationMap from "./LocationMap";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import API from "@/utils/API";
import { showError } from "@/utils";

const stopTypes = ["Pickup", "Dropoff", "Fueling", "Rest"];

const AddStop = ({ openAddStop, setOpenAddStop, currentTrip }) => {
  const dispatch = useDispatch();

  const [stopRecorded, setStopRecorded] = useState(false);

  const [stop, setStop] = useState({
    type: "",
    location: "",
    coords: null,
    startTime: null,
    endTime: null,
    isTiming: false,
  });

  // Function to get location name using reverse geocoding
  const fetchLocationName = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.display_name || "Unknown Location";
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Unknown Location";
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationName = await fetchLocationName(latitude, longitude);

        setStop((prev) => ({
          ...prev,
          location: locationName,
          coords: { lat: latitude, lng: longitude },
        }));
      },
      () => console.log("Unable to fetch location")
    );
  }, []);

  const handleLocationSelect = (name, coords) => {
    setStop((prev) => ({ ...prev, location: name, coords }));
  };

  const handleTypeChange = (event) => {
    setStop((prev) => ({ ...prev, type: event.target.value }));
  };

  const startTiming = (e) => {
    e.preventDefault();
    setStop((prev) => ({ ...prev, startTime: new Date(), endTime: null, isTiming: true }));
  };

  const endTiming = (e) => {
    e.preventDefault();
    const endTime = new Date();
    setStop((prev) => ({ ...prev, endTime, isTiming: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stop.location === "" || !stop.coords) {
      return window.alert(`You have to indicate the stop location before recording it`);
    }
    dispatch(toggleLoading(true));
    const body = {
      stop_location: { coords: stop.coords, name: stop.location },
      trip_detail: currentTrip.id,
      stop_type: stop.type,
      start_time: stop.startTime,
      end_time: stop.endTime,
    };
    await API.post(`/logbook/record-stop/`, body)
      .then((res) => {
        window.alert(res?.data?.message);
        setStop({
          type: "",
          location: "",
          coords: null,
          startTime: null,
          endTime: null,
          isTiming: false,
        });
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openAddStop} maxHeight="750px" maxWidth="1000px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>
          Time Your Stop Here or Search for Your Location Below: <br /> Location:{" "}
          <span style={{ fontSize: "1rem", color: "green" }}>{stop.location}</span>
        </h3>
        <div className="dialog-row">
          <span>
            <label htmlFor="stopType">Stop Type</label>
            <select id="stopType" value={stop.type} onChange={handleTypeChange} required>
              <option value="">-- Select Stop Type --</option>
              {stopTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </span>
          <span>
            <label>Search Location</label>
            <LocationSearch value={stop.location} onSelect={handleLocationSelect} />
          </span>
        </div>

        {/* Map Component */}
        {stop.coords && <LocationMap tripDetails={{ currentLocation: stop }} />}

        <div className="form-buttons">
          <button type="button" onClick={() => setOpenAddStop(false)}>
            Close
          </button>
          {stop.startTime && <p>Start Time: {stop.startTime.toLocaleTimeString()}</p>}
          {stop.endTime && <p>End Time: {stop.endTime.toLocaleTimeString()}</p>}
          {!stop.isTiming && !stop.startTime && (
            <button onClick={startTiming} className="add-button" type="button">
              Start Timing
            </button>
          )}
          {stop.isTiming && !stop.endTime && (
            <button onClick={endTiming} className="add-button" type="button">
              End Timing
            </button>
          )}
          {stop.startTime && stop.endTime && (
            <button type="submit" className="add-button">
              Record This Stop
            </button>
          )}
        </div>
      </form>
    </CustomModal>
  );
};

export default AddStop;
