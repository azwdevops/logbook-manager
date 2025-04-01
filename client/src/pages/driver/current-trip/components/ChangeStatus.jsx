import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Timer from "./Timer";

const ChangeStatus = (props) => {
  const { openChangeStatus, setOpenChangeStatus, currentTripDay, currentTripItem, setCurrentTripItem } = props;
  const dispatch = useDispatch();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.post(`/logbook/change-trip-status/`, {
      trip_day: currentTripDay?.id,
      item_type: selectedStatus,
      remarks,
      start_time: new Date().toISOString(),
      current_trip_item: currentTripItem,
    })
      .then((res) => {
        setRemarks("");
        setSelectedStatus("");
        setCurrentTripItem(res?.data?.trip_item_data);
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openChangeStatus} maxWidth="800px" maxHeight="350px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Change Status </h3>
        <p className="tc green bd">Changing status will stop the old timer and start a new timer for the newly set status</p>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "space-evenly", marginTop: "1rem" }}>
          <h4 className="tc">
            Current Status: <span className="green">{currentTripItem?.trip_item_name || <span className="red bd">Not Set</span>}</span>
          </h4>
          <Timer startTime={currentTripItem?.start_time} />
        </div>
        <div className="dialog-row-single-item">
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
          <label htmlFor="">Remarks</label>
          <input type="text" onChange={(e) => setRemarks(e.target.value)} value={remarks} required />
        </div>
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenChangeStatus(false)}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default ChangeStatus;
