import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

const CloseTripDay = (props) => {
  const { openCloseTripDay, setOpenCloseTripDay, currentTripDayId, currentTripItemId, setCurrentTripDay, setCurrentTripItem } = props;

  const dispatch = useDispatch();

  const [totalMilesDrivingToday, setTotalMilesDrivingToday] = useState("");
  const [mileageCoveredToday, setMileageCoveredToday] = useState("");

  const handleCloseTripDay = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.post(`/logbook/close-trip-day/`, {
      mileage_covered_today: mileageCoveredToday,
      total_miles_driving_today: totalMilesDrivingToday,
      trip_day_id: currentTripDayId,
      current_trip_item_id: currentTripItemId,
    })
      .then((res) => {
        setCurrentTripDay(null);
        setCurrentTripItem(null);
        setOpenCloseTripDay(false);
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openCloseTripDay} maxWidth="600px" maxHeight="300px">
      <form className="dialog" onSubmit={handleCloseTripDay}>
        <h3>Close the activities of the day</h3>
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
          <button type="button" onClick={() => setOpenCloseTripDay(false)}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CloseTripDay;
