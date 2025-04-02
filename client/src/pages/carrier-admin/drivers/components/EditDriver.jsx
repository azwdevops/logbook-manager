import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

/**
 * EditDriver component allows users to edit an existing driver's details.
 * It pre-fills the form with the current driver's data and updates it upon submission.
 */
const EditDriver = (props) => {
  const { openEditDriver, setOpenEditDriver, setDriversList, currentDriver } = props; // Props received from parent component

  const dispatch = useDispatch(); // Hook to dispatch Redux actions

  const [driverData, setDriverData] = useState({}); // State to store driver details

  /**
   * Updates driverData state whenever currentDriver changes.
   */
  useEffect(() => {
    setDriverData(currentDriver);
  }, [currentDriver]);

  /**
   * Handles input changes and updates the corresponding state.
   */
  const handleChange = (e) => {
    setDriverData({ ...driverData, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission by sending updated driver details to the backend.
   * Dispatches a loading state, makes an API call, updates the driver list, and handles errors.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form submission behavior
    dispatch(toggleLoading(true)); // Sets loading state to true

    await API.patch(`/users/maintain-drivers/`, {
      ...driverData,
      driver_initials: `${driverData?.first_name?.charAt(0)}${driverData?.last_name?.charAt(0)}`, // Generates driver initials
    })
      .then((res) => {
        // Updates the driver list with the newly updated driver data
        setDriversList((prev) =>
          prev?.map((item) => (item?.id === res?.data?.updated_driver_data?.id ? res?.data?.updated_driver_data : item))
        );

        // Displays success message
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err)) // Handles API errors
      .finally(() => dispatch(toggleLoading(false))); // Sets loading state to false
  };

  return (
    <CustomModal isOpen={openEditDriver} maxWidth="800px" maxHeight="300px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Edit Driver</h3>

        {/* Row for first and last name fields */}
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

        {/* Row for driver number and email fields */}
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

        {/* Form action buttons */}
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
