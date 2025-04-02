// Importing necessary components and utilities
import CustomModal from "@/components/shared/CustomModal"; // Custom modal component for displaying a modal dialog
import { toggleLoading } from "@/redux/features/sharedSlice"; // Redux action to toggle loading state
import { showError } from "@/utils"; // Utility function to display error messages
import API from "@/utils/API"; // API utility for making HTTP requests
import React, { useState } from "react"; // React library and useState hook
import { useDispatch } from "react-redux"; // Hook to dispatch Redux actions

// AddTruck component definition
const AddTruck = (props) => {
  // Destructuring props to access the modal state and trucks list management functions
  const { openAddTruck, setOpenAddTruck, setTrucksList, trucksList } = props;

  // Using Redux dispatch to dispatch actions
  const dispatch = useDispatch();

  // State to store the new truck's data
  const [newTruck, setNewTruck] = useState({
    truck_number: "", // Truck number field
    trailer_number: "", // Trailer number field
  });

  // Handle input field changes and update state
  const handleChange = (e) => {
    setNewTruck({ ...newTruck, [e.target.name]: e.target.value });
  };

  // Handle form submission (adding a new truck)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    dispatch(toggleLoading(true)); // Trigger loading state to indicate processing

    // Making a POST request to add a new truck
    await API.post(`/logbook/maintain-trucks/`, newTruck)
      .then((res) => {
        // Update the trucks list with the new truck data
        setTrucksList([...trucksList, res?.data?.new_truck_data]);

        // Reset the form state for the next submission
        setNewTruck({
          truck_number: "",
          trailer_number: "",
        });

        // Show an alert with the response message
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err)) // Handle any errors during the API request
      .finally(() => dispatch(toggleLoading(false))); // Ensure loading state is disabled after completion
  };

  return (
    // Custom modal to display the form
    <CustomModal isOpen={openAddTruck} maxWidth="600px" maxHeight="300px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Add New Truck</h3> {/* Form title */}
        {/* Truck number input field */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Truck Number</label>
          <input
            type="text"
            name="truck_number"
            onChange={handleChange}
            value={newTruck?.truck_number}
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
            value={newTruck?.trailer_number}
            required // Field is mandatory
          />
        </div>
        {/* Form action buttons */}
        <div className="form-buttons">
          {/* Close button to dismiss the modal */}
          <button type="button" onClick={() => setOpenAddTruck(false)}>
            Close
          </button>
          {/* Submit button to submit the form */}
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

// Exporting the AddTruck component for use in other parts of the app
export default AddTruck;
