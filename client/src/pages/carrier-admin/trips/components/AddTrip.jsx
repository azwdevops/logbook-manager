import React, { useEffect, useState } from "react";
import CustomModal from "@/components/shared/CustomModal";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import API from "@/utils/API";
import { fetchLocationName, showError } from "@/utils";
import LocationMap from "@/components/shared/trips/LocationMap";
import LocationSearch from "@/components/shared/trips/LocationSearch";

const AddTrip = ({ openAddTrip, setOpenAddTrip, tripsList, setTripsList }) => {
  const dispatch = useDispatch();

  const [tripDetails, setTripDetails] = useState({
    pickupLocation: { name: "", coords: null },
    dropoffLocation: { name: "", coords: null },
    currentLocation: { name: "", coords: null },
    currentCycle: "",
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationName = await fetchLocationName(latitude, longitude);

        setTripDetails((prev) => ({
          ...prev,
          currentLocation: { name: locationName, coords: { lat: latitude, lng: longitude } },
        }));
      },
      () => console.log("Unable to fetch location")
    );
  }, []);

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
    };
    await API.post(`/logbook/add-trip/`, body)
      .then((res) => {
        setTripsList([...tripsList, res.data.new_trip_data]);
        setTripDetails({
          pickupLocation: { name: "", coords: null },
          dropoffLocation: { name: "", coords: null },
          currentLocation: { name: "", coords: null },
          currentCycle: "",
        });
        window.alert(res?.data?.message);
        setOpenAddTrip(false);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openAddTrip} maxWidth="1200px" maxHeight="900px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Enter Trip Details</h3>
        <p className="bd">
          Your Current Location: <span className="green">{tripDetails?.currentLocation?.name}</span>
        </p>
        <div className="dialog-row">
          <span>
            <label>
              Current Location <span className="green">(If different from above location)</span>
            </label>
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
          <button type="button" onClick={() => setOpenAddTrip(false)}>
            Close
          </button>
          <button type="submit">Add Trip</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default AddTrip;
