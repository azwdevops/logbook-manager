import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import CustomModal from "@/components/shared/CustomModal";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import API from "@/utils/API";
import { fetchLocationName, showError } from "@/utils";
import LocationMap from "@/components/shared/trips/LocationMap";
import LocationSearch from "@/components/shared/trips/LocationSearch";

const stopTypes = ["Pickup", "Dropoff", "Fueling", "Rest"];

const AddStop = ({ openAddStop, setOpenAddStop, currentTripDay }) => {
  const dispatch = useDispatch();

  const [stop, setStop] = useState({
    type: "",
    location: "",
    coords: null,
    startTime: null,
    endTime: null,
    isTiming: false,
  });

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

  useEffect(() => {
    setStop((prev) => ({ ...prev, startTime: new Date(), endTime: null, isTiming: true }));
  }, []);

  const handleLocationSelect = (name, coords) => {
    setStop((prev) => ({ ...prev, location: name, coords }));
  };

  const handleTypeChange = (event) => {
    setStop((prev) => ({ ...prev, type: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stop.location === "" || !stop.coords) {
      return window.alert(`You have to indicate the stop location before recording it`);
    }
    dispatch(toggleLoading(true));
    const body = {
      stop_location: { coords: stop.coords, name: stop.location },
      trip_day: currentTripDay.id,
      stop_type: stop.type,
      start_time: stop.startTime,
      end_time: new Date(),
    };
    await API.post(`/logbook/record-stop/`, body)
      .then((res) => {
        setStop({
          type: "",
          location: "",
          coords: null,
          startTime: null,
          endTime: null,
          isTiming: false,
        });
      })
      .catch((err) => {})
      .finally(() => {
        dispatch(toggleLoading(false));
        setOpenAddStop(false);
      });
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
            <label>
              Search Location <span className="green">(if different from above location)</span>
            </label>
            <LocationSearch value={stop.location} onSelect={handleLocationSelect} />
          </span>
        </div>

        {/* Map Component */}
        {stop.coords && <LocationMap tripDetails={{ currentLocation: stop }} />}

        <div className="form-buttons">
          <button type="button" onClick={() => setOpenAddStop(false)}>
            Close
          </button>

          <button type="submit" className="add-button">
            Continue The Journey
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default AddStop;
