// Importing necessary components and utilities
import CustomModal from "@/components/shared/CustomModal"; // Custom modal component for displaying a modal dialog
import { toggleLoading } from "@/redux/features/sharedSlice"; // Redux action to toggle loading state
import { showError } from "@/utils"; // Utility function to display error messages
import API from "@/utils/API"; // API utility for making HTTP requests
import React, { useEffect, useState } from "react"; // React library and useState, useEffect hooks
import { useDispatch } from "react-redux"; // Hook to dispatch Redux actions

// EditTruck component definition
const EditTruck = (props) => {
  // Destructuring props to access the modal state, trucks list management functions, and current truck data
  const { openEditTruck, setOpenEditTruck, setTrucksList, currentTruck } = props;

  // Using Redux dispatch to dispatch actions
  const dispatch = useDispatch();

  // State to store the truck data being edited
  const [truckData, setTruckData] = useState({});

  // useEffect to update truckData whenever currentTruck prop changes
  useEffect(() => {
    setTruckData(currentTruck);
  }, [currentTruck]);

  // Handle input field changes and update state with the new value
  const handleChange = (e) => {
    setTruckData({ ...truckData, [e.target.name]: e.target.value });
  };

  // Handle form submission (updating the truck)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    dispatch(toggleLoading(true)); // Trigger loading state to indicate processing

    // Making a PATCH request to update the truck data
    await API.patch(`/logbook/maintain-trucks/`, truckData)
      .then((res) => {
        // Update the trucks list with the updated truck data
        setTrucksList((prev) =>
          prev?.map((item) =>
            // If the truck ID matches, replace it with the updated truck data
            item?.id === res?.data?.updated_truck_data?.id ? res?.data?.updated_truck_data : item
          )
        );

        // Show an alert with the response message
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err)) // Handle any errors during the API request
      .finally(() => dispatch(toggleLoading(false))); // Ensure loading state is disabled after completion
  };

  return (
    // Custom modal to display the form
    <CustomModal isOpen={openEditTruck} maxWidth="500px" maxHeight="300px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Edit Truck Driver</h3> {/* Form title */}
        {/* Truck number input field */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Truck Number</label>
          <input
            type="text"
            name="truck_number"
            onChange={handleChange}
            value={truckData?.truck_number}
            required // Field is mandatory
          />
        </div>
        {/* Trailer number input field */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Trailer Number</label>
          <input
            type="text"
            name="trailer_number"
            onChange={handleChange}
            value={truckData?.trailer_number}
            required // Field is mandatory
          />
        </div>
        {/* Form action buttons */}
        <div className="form-buttons">
          {/* Close button to dismiss the modal */}
          <button type="button" onClick={() => setOpenEditTruck(false)}>
            Close
          </button>
          {/* Submit button to submit the form */}
          <button type="submit">Update</button>
        </div>
      </form>
    </CustomModal>
  );
};

// Exporting the EditTruck component for use in other parts of the app
export default EditTruck;
