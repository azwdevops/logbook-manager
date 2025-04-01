import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Timer from "./Timer";

const StartTripDay = (props) => {
  const { openStartTripDay, setOpenStartTripDay, setCurrentTripItem, currentTripId, setCurrentTripDay } = props;
  const dispatch = useDispatch();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.post(`/logbook/start-trip-day/`, {
      trip_detail_id: currentTripId,
      item_type: selectedStatus,
      remarks,
    })
      .then((res) => {
        setCurrentTripItem(res?.data?.trip_item_data);
        setCurrentTripDay(res?.data?.trip_day_data);
        window.alert(res?.data?.message);
        setOpenStartTripDay(false);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openStartTripDay} maxWidth="600px" maxHeight="300px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Start the day by selecting the activity </h3>

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
        <div className="dialog-row-single-item">
          <label htmlFor="">Remarks</label>
          <input type="text" onChange={(e) => setRemarks(e.target.value)} value={remarks} required />
        </div>
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
