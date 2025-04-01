import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

const AddDriver = (props) => {
  const { openAddDriver, setOpenAddDriver, setDriversList, driversList } = props;

  const dispatch = useDispatch();

  const [newDriver, setNewDriver] = useState({
    first_name: "",
    last_name: "",
    email: "",
    driver_number: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setNewDriver({ ...newDriver, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.post(`/users/maintain-drivers/`, {
      ...newDriver,
      driver_initials: `${newDriver?.first_name?.charAt(0)}${newDriver?.last_name?.charAt(0)}`,
    })
      .then((res) => {
        setDriversList([...driversList, res?.data?.new_driver_data]);
        setNewDriver({
          first_name: "",
          last_name: "",
          email: "",
          driver_number: "",
          password: "",
          confirm_password: "",
        });
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openAddDriver} maxWidth="800px" maxHeight="350px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Add New Driver</h3>
        <div className="dialog-row">
          <span>
            <label htmlFor="">First Name</label>
            <input type="text" name="first_name" onChange={handleChange} value={newDriver?.first_name} required />
          </span>
          <span>
            <label htmlFor="">Last Name</label>
            <input type="text" name="last_name" onChange={handleChange} value={newDriver?.last_name} required />
          </span>
        </div>
        <div className="dialog-row">
          <span>
            <label htmlFor="">Driver Number</label>
            <input type="text" name="driver_number" onChange={handleChange} value={newDriver?.driver_number} required />
          </span>
          <span>
            <label htmlFor="">Email Address</label>
            <input type="text" name="email" onChange={handleChange} value={newDriver?.email} required />
          </span>
        </div>
        <div className="dialog-row">
          <span>
            <label htmlFor="">Password</label>
            <input type="password" name="password" onChange={handleChange} value={newDriver?.password} required />
          </span>
          <span>
            <label htmlFor="">Confirm Password</label>
            <input type="password" name="confirm_password" onChange={handleChange} value={newDriver?.confirm_password} required />
          </span>
        </div>
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenAddDriver(false)}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default AddDriver;
