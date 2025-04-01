import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

const AddTruck = (props) => {
  const { openAddTruck, setOpenAddTruck, setTrucksList, trucksList } = props;

  const dispatch = useDispatch();

  const [newTruck, setNewTruck] = useState({
    truck_number: "",
    trailer_number: "",
  });

  const handleChange = (e) => {
    setNewTruck({ ...newTruck, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.post(`/logbook/maintain-trucks/`, newTruck)
      .then((res) => {
        setTrucksList([...trucksList, res?.data?.new_truck_data]);
        setNewTruck({
          truck_number: "",
          trailer_number: "",
        });
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openAddTruck} maxWidth="600px" maxHeight="300px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Add New Truck</h3>
        <div className="dialog-row-single-item">
          <label htmlFor="">Truck Number</label>
          <input type="text" name="truck_number" onChange={handleChange} value={newTruck?.truck_number} required />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">Trailer Number</label>
          <input type="text" name="trailer_number" onChange={handleChange} value={newTruck?.trailer_number} required />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => setOpenAddTruck(false)}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default AddTruck;
