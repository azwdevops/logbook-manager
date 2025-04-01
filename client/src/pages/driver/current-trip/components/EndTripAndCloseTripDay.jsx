import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import { useState } from "react";
import { useDispatch } from "react-redux";

const EndTripAndCloseTripDay = (props) => {
  const {
    openEndTripAndCloseTripDay,
    setOpenEndTripAndCloseTripDay,
    currentTripId,
    currentTripItemId,
    setCurrentTrip,
    setCurrentTripItem,
    currentTripDayId,
  } = props;

  const dispatch = useDispatch();

  const [totalMilesDrivingToday, setTotalMilesDrivingToday] = useState("");
  const [mileageCoveredToday, setMileageCoveredToday] = useState("");

  const handleEndTrip = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.post(`/logbook/end-trip/`, {
      tripId: currentTripId,
      current_trip_item_id: currentTripItemId,
      close_trip_day: true,
      mileage_covered_today: mileageCoveredToday,
      total_miles_driving_today: totalMilesDrivingToday,
      trip_day_id: currentTripDayId,
      trip_end_date: new Date().toISOString().split("T")[0],
    })
      .then((res) => {
        setCurrentTrip(null);
        setCurrentTripItem(null);
        setOpenEndTripAndCloseTripDay(false);
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openEndTripAndCloseTripDay} maxWidth="650px" maxHeight="300px">
      <form className="dialog" onSubmit={handleEndTrip}>
        <h3>Enter the miles covered today so far to end the trip</h3>
        <div className="dialog-row-single-item">
          <label htmlFor="">Total Miles Driving Today</label>
          <input
            type="number"
            onChange={(e) => setTotalMilesDrivingToday(e.target.value)}
            min="0"
            value={totalMilesDrivingToday}
            required
          />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">
            Total Mileage Today <span className="green">(if different from total miles driving above)</span>
          </label>
          <input type="number" onChange={(e) => setMileageCoveredToday(e.target.value)} min="0" value={mileageCoveredToday} />
        </div>
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
