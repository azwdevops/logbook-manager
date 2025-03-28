import React, { useState } from "react";
import LocationMap from "./LocationMap";
import CustomModal from "@/components/shared/CustomModal";

const TripInputForm = ({ openTripInputForm, setOpenTripInputForm }) => {
  const [tripDetails, setTripDetails] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    currentCycle: "",
    currentLocation: "",
  });

  const handleChange = (e) => {
    setTripDetails({ ...tripDetails, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (latlng) => {
    const locationString = `${latlng.lat}, ${latlng.lng}`;
    setTripDetails((prev) => ({ ...prev, currentLocation: locationString }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Trip Details Submitted:", tripDetails);
  };

  return (
    <CustomModal isOpen={openTripInputForm} maxWidth="1000px" maxHeight="700px">
      <form className="dialog">
        <h3>Enter Trip Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="dialog-row">
            <span>
              <label htmlFor="">Pickup Location</label>
              <input type="text" name="pickupLocation" value={tripDetails.pickupLocation} required />
            </span>
            <span>
              <label htmlFor="">Dropoff Location</label>
              <input type="text" name="dropoffLocation" value={tripDetails.dropoffLocation} required />
            </span>
            <span>
              <label htmlFor="">Cycle Used</label>
              <select name="currentCycle" value={tripDetails.currentCycle} onChange={handleChange} required>
                <option value="">--select cycle--</option>
                <option value="60-hour/7-day">60 hour/7 days</option>
                <option value="70-hour/8-day">70 hour/8 days</option>
              </select>
            </span>
          </div>

          <div className="dialog-row-single-item">
            <label htmlFor="">Click on the map to set Current Location</label>
            <LocationMap onLocationSelect={handleLocationSelect} />
          </div>
          <div className="dialog-row-single-item">
            <label htmlFor="">Current Location</label>
            <input type="text" value={tripDetails.currentLocation} style={{ cursor: "not-allowed" }} disabled />
          </div>

          <div className="form-buttons">
            <button type="button" onClick={() => setOpenTripInputForm(false)}>
              Close
            </button>
            <button type="submit">Add Trip</button>
          </div>
        </form>
      </form>
    </CustomModal>
  );
};

export default TripInputForm;
