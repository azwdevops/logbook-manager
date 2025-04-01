import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const AssignDriver = (props) => {
  const { openAssignDriver, setOpenAssignDriver, currentTrip, setTripsList } = props;

  const dispatch = useDispatch();

  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableTrucks, setAvailableTrucks] = useState([]);

  const [selectedDriver, setSelectedDriver] = useState("");
  const [tripStartDate, setTripStartDate] = useState("");
  const [selectedTruck, setSelectedTruck] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/users/get-available-carrier-drivers/`)
        .then((res) => {
          setAvailableDrivers(res?.data?.available_drivers_data);
          setAvailableTrucks(res?.data?.available_trucks_data);
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.post(`/logbook/assign-trip-driver/`, {
      driverId: selectedDriver?.id,
      truckId: selectedTruck?.id,
      tripId: currentTrip?.id,
      tripStartDate,
    })
      .then((res) => {
        setTripsList((prev) => prev?.map((item) => (item?.id === res?.data?.updated_trip_data?.id ? res?.data?.updated_trip_data : item)));
        window.alert(res?.data?.message);
        setOpenAssignDriver(false);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openAssignDriver} maxWidth="700px" maxHeight="600px">
      <form className="dialog">
        <h3>Assign a driver for this trip</h3>
        <div className="dialog-row-single-item">
          <label htmlFor="">Pickup Location</label>
          <input type="text" value={currentTrip?.pickup_location_name} disabled />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">Dropoff Location</label>
          <input type="text" value={currentTrip?.dropoff_location_name} disabled />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">Select Driver</label>
          <Autocomplete
            key="available-drivers"
            value={selectedDriver?.id}
            onChange={(e, newValue) => setSelectedDriver(newValue)}
            options={availableDrivers}
            getOptionLabel={(option) => (option ? `${option?.driver_number} ${option?.first_name} ${option?.last_name}` : "")}
            renderInput={(params) => <TextField {...params} label="" placeholder="Select" required />}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            disablePortal
            disableClearable
          />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">Select Truck</label>
          <Autocomplete
            key="available-trucks"
            value={selectedTruck?.id}
            onChange={(e, newValue) => setSelectedTruck(newValue)}
            options={availableTrucks}
            getOptionLabel={(option) => (option ? `${option?.truck_number} ${option?.trailer_number}` : "")}
            renderInput={(params) => <TextField {...params} label="" placeholder="Select" required />}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            disablePortal
            disableClearable
          />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">Trip Start Date</label>
          <input type="date" onChange={(e) => setTripStartDate(e.target.value)} value={tripStartDate} required />
        </div>
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenAssignDriver(false)}>
            Close
          </button>
          <button type="submit" onClick={handleSubmit}>
            Assign Driver
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default AssignDriver;
