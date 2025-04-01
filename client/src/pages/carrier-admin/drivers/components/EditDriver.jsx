import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const EditDriver = (props) => {
  const { openEditDriver, setOpenEditDriver, setDriversList, currentDriver } = props;

  const dispatch = useDispatch();

  const [driverData, setDriverData] = useState({});

  useEffect(() => {
    setDriverData(currentDriver);
  }, [currentDriver]);

  const handleChange = (e) => {
    setDriverData({ ...driverData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.patch(`/users/maintain-drivers/`, {
      ...driverData,
      driver_initials: `${driverData?.first_name?.charAt(0)}${driverData?.last_name?.charAt(0)}`,
    })
      .then((res) => {
        setDriversList((prev) =>
          prev?.map((item) => (item?.id === res?.data?.updated_driver_data?.id ? res?.data?.updated_driver_data : item))
        );

        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openEditDriver} maxWidth="800px" maxHeight="300px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Edit Driver</h3>
        <div className="dialog-row">
          <span>
            <label htmlFor="">First Name</label>
            <input type="text" name="first_name" onChange={handleChange} value={driverData?.first_name} required />
          </span>
          <span>
            <label htmlFor="">Last Name</label>
            <input type="text" name="last_name" onChange={handleChange} value={driverData?.last_name} required />
          </span>
        </div>
        <div className="dialog-row">
          <span>
            <label htmlFor="">Driver Number</label>
            <input type="text" name="driver_number" onChange={handleChange} value={driverData?.driver_number} required />
          </span>
          <span>
            <label htmlFor="">Email Address</label>
            <input type="text" name="email" onChange={handleChange} value={driverData?.email} required />
          </span>
        </div>
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenEditDriver(false)}>
            Close
          </button>
          <button type="submit">Update</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default EditDriver;
