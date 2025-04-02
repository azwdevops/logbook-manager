// Import necessary components and utilities
import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice"; // Redux action to toggle loading state
import { showError } from "@/utils"; // Utility function to display errors
import API from "@/utils/API"; // API utility for making requests
import { useState } from "react"; // React hook to manage state
import { useDispatch } from "react-redux"; // Redux hook to dispatch actions

// Functional component to end the trip and close the trip day
const EndTripAndCloseTripDay = (props) => {
  // Destructure props passed into the component
  const {
    openEndTripAndCloseTripDay,
    setOpenEndTripAndCloseTripDay,
    currentTripId,
    currentTripItemId,
    setCurrentTrip,
    setCurrentTripItem,
    currentTripDayId,
  } = props;

  // Redux dispatch hook to dispatch actions
  const dispatch = useDispatch();

  // Local state to hold total miles and mileage covered for the current trip day
  const [totalMilesDrivingToday, setTotalMilesDrivingToday] = useState("");
  const [mileageCoveredToday, setMileageCoveredToday] = useState("");

  // Handle the end trip action
  const handleEndTrip = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    dispatch(toggleLoading(true)); // Dispatch action to toggle loading state

    // Make API call to end the trip and close the trip day
    await API.post(`/logbook/end-trip/`, {
      tripId: currentTripId,
      current_trip_item_id: currentTripItemId,
      close_trip_day: true,
      mileage_covered_today: mileageCoveredToday,
      total_miles_driving_today: totalMilesDrivingToday,
      trip_day_id: currentTripDayId,
    })
      .then((res) => {
        // If the API call is successful, reset trip data and close the modal
        setCurrentTrip(null);
        setCurrentTripItem(null);
        setOpenEndTripAndCloseTripDay(false);
        window.alert(res?.data?.message); // Show success message
      })
      .catch((err) => showError(err)) // Show error if the API call fails
      .finally(() => dispatch(toggleLoading(false))); // Ensure loading state is turned off after completion
  };

  return (
    // Modal component to show the trip end form
    <CustomModal isOpen={openEndTripAndCloseTripDay} maxWidth="650px" maxHeight="300px">
      <form className="dialog" onSubmit={handleEndTrip}>
        <h3>Enter the miles covered today so far to end the trip</h3>

        {/* Input for total miles driven today */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Total Miles Driving Today</label>
          <input
            type="number"
            onChange={(e) => setTotalMilesDrivingToday(e.target.value)} // Update state on change
            min="0"
            value={totalMilesDrivingToday}
            required // Make field required
          />
        </div>

        {/* Input for mileage covered today, if different from total miles driving */}
        <div className="dialog-row-single-item">
          <label htmlFor="">
            Total Mileage Today <span className="green">(if different from total miles driving above)</span>
          </label>
          <input
            type="number"
            onChange={(e) => setMileageCoveredToday(e.target.value)} // Update state on change
            min="0"
            value={mileageCoveredToday}
          />
        </div>

        {/* Buttons to close the modal or submit the form */}
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenEndTripAndCloseTripDay(false)}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default EndTripAndCloseTripDay;
