import CustomModal from "@/components/shared/CustomModal"; // Import CustomModal component for modal dialog
import { toggleLoading } from "@/redux/features/sharedSlice"; // Import toggleLoading action for Redux state management
import { showError } from "@/utils"; // Import showError utility for handling errors
import API from "@/utils/API"; // Import API utility for making HTTP requests
import React, { useState } from "react"; // Import React and useState hook
import { useDispatch } from "react-redux"; // Import useDispatch hook for dispatching actions to Redux store

const CloseTripDay = (props) => {
  const { openCloseTripDay, setOpenCloseTripDay, currentTripDayId, currentTripItemId, setCurrentTripDay, setCurrentTripItem } = props; // Destructure props passed to the component

  const dispatch = useDispatch(); // Initialize dispatch for Redux actions

  const [totalMilesDrivingToday, setTotalMilesDrivingToday] = useState(""); // State to manage total miles driven today
  const [mileageCoveredToday, setMileageCoveredToday] = useState(""); // State to manage total mileage covered today

  // Handle closing of the trip day
  const handleCloseTripDay = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    dispatch(toggleLoading(true)); // Dispatch loading state to Redux store

    // API request to close the trip day
    await API.post(`/logbook/close-trip-day/`, {
      mileage_covered_today: mileageCoveredToday, // Pass mileage covered today
      total_miles_driving_today: totalMilesDrivingToday, // Pass total miles driven today
      trip_day_id: currentTripDayId, // Pass the current trip day ID
      current_trip_item_id: currentTripItemId, // Pass the current trip item ID
    })
      .then((res) => {
        // On success, reset states and show success message
        setCurrentTripDay(null); // Clear current trip day
        setCurrentTripItem(null); // Clear current trip item
        setOpenCloseTripDay(false); // Close the modal
        window.alert(res?.data?.message); // Show success message
      })
      .catch((err) => showError(err)) // Handle errors by calling showError utility
      .finally(() => dispatch(toggleLoading(false))); // Dispatch loading state (false) once request completes
  };

  return (
    // Render CustomModal component for closing trip day form
    <CustomModal isOpen={openCloseTripDay} maxWidth="600px" maxHeight="300px">
      <form className="dialog" onSubmit={handleCloseTripDay}>
        <h3>Close the activities of the day</h3>
        <div className="dialog-row-single-item">
          {/* Input field for total miles driven today */}
          <label htmlFor="">Total Miles Driving Today</label>
          <input
            type="number" // Input field for entering total miles driven
            onChange={(e) => setTotalMilesDrivingToday(e.target.value)} // Update state on input change
            min="0" // Minimum value of 0
            value={totalMilesDrivingToday} // Bind the input value to state
            required // Make this field required
          />
        </div>
        <div className="dialog-row-single-item">
          {/* Input field for total mileage covered today (optional) */}
          <label htmlFor="">
            Total Mileage Today <span className="green">(if different from total miles driving above)</span>
          </label>
          <input
            type="number" // Input field for entering total mileage covered
            onChange={(e) => setMileageCoveredToday(e.target.value)} // Update state on input change
            min="0" // Minimum value of 0
            value={mileageCoveredToday} // Bind the input value to state
          />
        </div>
        <div className="form-buttons">
          {/* Button to close the modal without submitting */}
          <button type="button" onClick={() => setOpenCloseTripDay(false)}>
            Close
          </button>
          {/* Submit button to submit the form and close the trip day */}
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CloseTripDay; // Export CloseTripDay component
