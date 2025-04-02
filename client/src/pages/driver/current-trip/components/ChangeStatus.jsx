import CustomModal from "@/components/shared/CustomModal"; // Import CustomModal component for displaying modal dialog
import { toggleLoading } from "@/redux/features/sharedSlice"; // Import toggleLoading action for Redux state management
import { showError } from "@/utils"; // Import showError utility for error handling
import API from "@/utils/API"; // Import API utility for making HTTP requests
import React, { useState } from "react"; // Import React and useState hook
import { useDispatch } from "react-redux"; // Import useDispatch hook for dispatching actions to Redux store
import Timer from "./Timer"; // Import Timer component to display a timer for the current trip item

const ChangeStatus = (props) => {
  const { openChangeStatus, setOpenChangeStatus, currentTripDay, currentTripItem, setCurrentTripItem } = props; // Destructure props
  const dispatch = useDispatch(); // Initialize dispatch for Redux actions

  const [selectedStatus, setSelectedStatus] = useState(""); // State to manage selected status for the trip
  const [remarks, setRemarks] = useState(""); // State to manage remarks input

  // Handle form submission to update trip status
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    dispatch(toggleLoading(true)); // Dispatch loading state to Redux store

    // API request to update the trip status
    await API.post(`/logbook/change-trip-status/`, {
      trip_day: currentTripDay?.id, // Pass current trip day ID
      item_type: selectedStatus, // Pass selected trip status
      remarks, // Pass remarks entered by the user
      current_trip_item: currentTripItem, // Pass current trip item data
    })
      .then((res) => {
        // Reset form state upon successful response
        setRemarks(""); // Clear remarks input
        setSelectedStatus(""); // Clear selected status
        setCurrentTripItem(res?.data?.trip_item_data); // Update current trip item with new data
        window.alert(res?.data?.message); // Display success message
      })
      .catch((err) => showError(err)) // Handle errors by calling showError
      .finally(() => dispatch(toggleLoading(false))); // Dispatch loading state (false) when request completes
  };

  return (
    // Render CustomModal component for the status change form
    <CustomModal isOpen={openChangeStatus} maxWidth="800px" maxHeight="350px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Change Status </h3>
        {/* Information about what changing status will do */}
        <p className="tc green bd">Changing status will stop the old timer and start a new timer for the newly set status</p>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "space-evenly", marginTop: "1rem" }}>
          {/* Display current status and Timer component */}
          <h4 className="tc">
            Current Status: <span className="green">{currentTripItem?.trip_item_name || <span className="red bd">Not Set</span>}</span>
          </h4>
          {/* Display timer based on the current trip item start time */}
          <Timer startTime={currentTripItem?.start_time} />
        </div>
        <div className="dialog-row-single-item">
          {/* Dropdown to select new trip status */}
          <label htmlFor="">Select New Trip Status</label>
          <select name="" onChange={(e) => setSelectedStatus(e.target.value)} value={selectedStatus} required>
            <option value="">--select status -- </option>
            <option value="driving">Driving</option>
            <option value="off-duty">Off Duty</option>
            <option value="on-duty-not-driving">On Duty (Not Driving)</option>
            <option value="sleeper-berth">Sleeper Berth</option>
          </select>
        </div>
        <div className="dialog-row-single-item">
          {/* Input field for remarks */}
          <label htmlFor="">Remarks</label>
          <input type="text" onChange={(e) => setRemarks(e.target.value)} value={remarks} required />
        </div>
        <div className="form-buttons">
          {/* Button to close the modal */}
          <button type="button" onClick={() => setOpenChangeStatus(false)}>
            Close
          </button>
          {/* Submit button to apply the status change */}
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default ChangeStatus; // Export ChangeStatus component
