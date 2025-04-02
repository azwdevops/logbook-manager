import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

/**
 * AddDriver component allows users to add a new driver.
 * It includes a form inside a modal, collects driver details, and submits them to the backend.
 */
const AddDriver = (props) => {
  const { openAddDriver, setOpenAddDriver, setDriversList, driversList } = props; // Props received from parent component

  const dispatch = useDispatch(); // Hook to dispatch Redux actions

  // State to manage the new driver form inputs
  const [newDriver, setNewDriver] = useState({
    first_name: "",
    last_name: "",
    email: "",
    driver_number: "",
    password: "",
    confirm_password: "",
  });

  /**
   * Handles input changes and updates the corresponding state.
   */
  const handleChange = (e) => {
    setNewDriver({ ...newDriver, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission by sending a request to add a new driver.
   * Dispatches a loading state, makes an API call, updates the driver list, and handles errors.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form submission behavior
    dispatch(toggleLoading(true)); // Sets loading state to true

    await API.post(`/users/maintain-drivers/`, {
      ...newDriver,
      driver_initials: `${newDriver?.first_name?.charAt(0)}${newDriver?.last_name?.charAt(0)}`, // Generates driver initials
    })
      .then((res) => {
        // Updates the driver list with the newly added driver
        setDriversList([...driversList, res?.data?.new_driver_data]);

        // Resets the form fields after successful submission
        setNewDriver({
          first_name: "",
          last_name: "",
          email: "",
          driver_number: "",
          password: "",
          confirm_password: "",
        });

        // Displays success message
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err)) // Handles API errors
      .finally(() => dispatch(toggleLoading(false))); // Sets loading state to false
  };

  return (
    <CustomModal isOpen={openAddDriver} maxWidth="800px" maxHeight="350px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Add New Driver</h3>

        {/* Row for first and last name fields */}
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

        {/* Row for driver number and email fields */}
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

        {/* Row for password and confirm password fields */}
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

        {/* Form action buttons */}
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
