import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const EditTruck = (props) => {
  const { openEditTruck, setOpenEditTruck, setTrucksList, currentTruck } = props;

  const dispatch = useDispatch();

  const [truckData, setTruckData] = useState({});

  useEffect(() => {
    setTruckData(currentTruck);
  }, [currentTruck]);

  const handleChange = (e) => {
    setTruckData({ ...truckData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.patch(`/logbook/maintain-trucks/`, truckData)
      .then((res) => {
        setTrucksList((prev) =>
          prev?.map((item) => (item?.id === res?.data?.updated_truck_data?.id ? res?.data?.updated_truck_data : item))
        );

        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openEditTruck} maxWidth="500px" maxHeight="300px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Edit Truck Driver</h3>
        <div className="dialog-row-single-item">
          <label htmlFor="">Truck Number</label>
          <input type="text" name="truck_number" onChange={handleChange} value={truckData?.truck_number} required />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">Trailer Number</label>
          <input type="text" name="trailer_number" onChange={handleChange} value={truckData?.trailer_number} required />
        </div>
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenEditTruck(false)}>
            Close
          </button>
          <button type="submit">Update</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default EditTruck;
