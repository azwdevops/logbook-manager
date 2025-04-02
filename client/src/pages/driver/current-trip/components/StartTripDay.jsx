// Import necessary components and utilities
import CustomModal from "@/components/shared/CustomModal"; // Custom modal component for displaying the form
import { toggleLoading } from "@/redux/features/sharedSlice"; // Redux action to toggle loading state
import { showError } from "@/utils"; // Utility function for displaying errors
import API from "@/utils/API"; // API utility for making requests
import React, { useState } from "react"; // React hook for managing component state
import { useDispatch } from "react-redux"; // Redux hook for dispatching actions
import Timer from "./Timer"; // Timer component (unused in this snippet, but may be used elsewhere)

// Functional component for starting a trip day
const StartTripDay = (props) => {
  // Destructure props passed into the component
  const { openStartTripDay, setOpenStartTripDay, setCurrentTripItem, currentTripId, setCurrentTripDay } = props;

  // Dispatch hook for Redux actions
  const dispatch = useDispatch();

  // State to manage the selected trip status and remarks
  const [selectedStatus, setSelectedStatus] = useState(""); // Holds the selected status (driving, off-duty, etc.)
  const [remarks, setRemarks] = useState(""); // Holds remarks input by the user

  // Handle form submission to start the trip day
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    dispatch(toggleLoading(true)); // Dispatch the action to show loading state

    // Make the API call to start the trip day
    await API.post(`/logbook/start-trip-day/`, {
      trip_detail_id: currentTripId, // Send the current trip ID
      item_type: selectedStatus, // Send the selected status (driving, off-duty, etc.)
      remarks, // Send the remarks provided by the user
    })
      .then((res) => {
        // If successful, update the trip item and day, and show a success message
        setCurrentTripItem(res?.data?.trip_item_data); // Set the current trip item data
        setCurrentTripDay(res?.data?.trip_day_data); // Set the current trip day data
        window.alert(res?.data?.message); // Show a success message
        setOpenStartTripDay(false); // Close the modal
      })
      .catch((err) => showError(err)) // Catch and show any errors that occur
      .finally(() => dispatch(toggleLoading(false))); // Finally, stop the loading state
  };

  return (
    // CustomModal is used to show the trip day start form
    <CustomModal isOpen={openStartTripDay} maxWidth="600px" maxHeight="300px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Start the day by selecting the activity</h3>

        {/* Dropdown for selecting the trip status */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Select Trip Status</label>
          <select name="" onChange={(e) => setSelectedStatus(e.target.value)} value={selectedStatus} required>
            <option value="">--select status -- </option>
            <option value="driving">Driving</option>
            <option value="off-duty">Off Duty</option>
            <option value="on-duty-not-driving">On Duty (Not Driving)</option>
            <option value="sleeper-berth">Sleeper Berth</option>
          </select>
        </div>

        {/* Input field for remarks */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Remarks</label>
          <input type="text" onChange={(e) => setRemarks(e.target.value)} value={remarks} required />
        </div>

        {/* Buttons to either submit the form or close the modal */}
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenStartTripDay(false)}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default StartTripDay;
