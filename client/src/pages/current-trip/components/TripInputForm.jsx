import React, { useState } from "react";
import LocationMap from "./LocationMap";
import CustomModal from "@/components/shared/CustomModal";
import LocationSearch from "./LocationSearch"; // New component
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import API from "@/utils/API";
import { showError } from "@/utils";

const TripInputForm = ({ openTripInputForm, setOpenTripInputForm, setCurrentTrip, setCurrentTripDay }) => {
  const dispatch = useDispatch();

  const userId = useSelector((state) => state?.auth?.user?.id);

  const [tripDetails, setTripDetails] = useState({
    pickupLocation: { name: "", coords: null },
    dropoffLocation: { name: "", coords: null },
    currentLocation: { name: "", coords: null },
    currentCycle: "",
  });

  const handleLocationSelect = (field, name, coords) => {
    setTripDetails((prev) => ({
      ...prev,
      [field]: { name, coords },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    const body = {
      pickup_location: tripDetails.pickupLocation,
      dropoff_location: tripDetails.dropoffLocation,
      current_location: tripDetails.currentLocation,
      cycle_used: tripDetails.currentCycle,
      trip_start_date: new Date().toISOString().split("T")[0],
      driver: userId,
      is_current: true,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
    };
    await API.post(`/logbook/add-trip/`, body)
      .then((res) => {
        setTripDetails({
          pickupLocation: { name: "", coords: null },
          dropoffLocation: { name: "", coords: null },
          currentLocation: { name: "", coords: null },
          currentCycle: "",
        });
        setCurrentTrip(res?.data?.current_trip_data);
        setCurrentTripDay(res?.data?.trip_day_data);
        window.alert(res?.data?.message);
        setOpenTripInputForm(false);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openTripInputForm} maxWidth="1200px" maxHeight="900px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Enter Trip Details</h3>
        <div className="dialog-row">
          <span>
            <label>Current Location</label>
            <LocationSearch
              value={tripDetails.currentLocation.name}
              onSelect={(name, coords) => handleLocationSelect("currentLocation", name, coords)}
            />
          </span>
          <span>
            <label>Pickup Location</label>
            <LocationSearch
              value={tripDetails.pickupLocation.name}
              onSelect={(name, coords) => handleLocationSelect("pickupLocation", name, coords)}
            />
          </span>
        </div>
        <div className="dialog-row">
          <span>
            <label>Dropoff Location</label>
            <LocationSearch
              value={tripDetails.dropoffLocation.name}
              onSelect={(name, coords) => handleLocationSelect("dropoffLocation", name, coords)}
            />
          </span>
          <span>
            <label>Cycle Used</label>
            <select
              name="currentCycle"
              value={tripDetails.currentCycle}
              onChange={(e) => setTripDetails({ ...tripDetails, currentCycle: e.target.value })}
              required
            >
              <option value="">--select cycle--</option>
              <option value="60-hour/7-day">60 hour/7 days</option>
              <option value="70-hour/8-day">70 hour/8 days</option>
            </select>
          </span>
        </div>

        <div className="dialog-row-single-item"></div>

        <div className="dialog-row-single-item">
          <label>Map</label>
          <LocationMap tripDetails={tripDetails} />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => setOpenTripInputForm(false)}>
            Close
          </button>
          <button type="submit">Add Trip</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default TripInputForm;
