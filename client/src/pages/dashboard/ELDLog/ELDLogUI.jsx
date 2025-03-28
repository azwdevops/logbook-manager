import React, { useEffect, useState } from "react";
import TitleComponent from "./ELDComponents/TitleComponent";

import "./ELDLogUI.css";
import CarriersComponent from "./ELDComponents/CarriersComponent";
import Schedule from "./ELDComponents/Schedule";
import Remarks from "./ELDComponents/Remarks";
import Recap from "./ELDComponents/Recap";
import CustomModal from "@/components/shared/CustomModal";
import API from "@/utils/API";
import { showError } from "@/utils";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";

const ELDLogUI = (props) => {
  const { openELDLog, setOpenELDLog, selectedTripId } = props;

  const [tripLogbook, setTripLogbook] = useState({});

  const { trip_date, driver_initials, driver_number, pickup_location_name, dropoff_location_name } = tripLogbook;

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/logbook/get-logbook-detail/${selectedTripId}/`)
        .then((res) => {
          setTripLogbook(res?.data?.trip_logbooks_data);
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch, selectedTripId]);

  return (
    <CustomModal isOpen={openELDLog} maxWidth="1200px" maxHeight="800px">
      <div className="daily-log dialog">
        <TitleComponent
          trip_date={trip_date}
          driver_initials={driver_initials}
          driver_number={driver_number}
          pickup_location_name={pickup_location_name}
          dropoff_location_name={dropoff_location_name}
        />
        <CarriersComponent />
        <br />
        <br />
        <Schedule />
        <br />
        <Remarks />
        <br />
        <Recap />
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenELDLog(false)}>
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ELDLogUI;
