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
  const { openELDLog, setOpenELDLog, selectedTripId, logbookIndex } = props;

  const [tripLogbook, setTripLogbook] = useState({});

  const {
    trip_date,
    driver_initials,
    driver_number,
    pickup_location_name,
    dropoff_location_name,
    trip_items,
    mileage_covered_today,
    total_miles_driving_today,
    truck_trailer_number,
    on_duty_hours,
    on_duty_hours_last_seven_days,
    on_duty_hours_last_five_days,
    on_duty_hours_last_eight_days,
  } = tripLogbook;

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/logbook/get-logbook-detail/${selectedTripId}/${logbookIndex}/`)
        .then((res) => {
          setTripLogbook(res?.data?.trip_day_data);
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch, selectedTripId, logbookIndex]);

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
        <CarriersComponent
          mileage_covered_today={mileage_covered_today}
          total_miles_driving_today={total_miles_driving_today}
          truck_trailer_number={truck_trailer_number}
        />
        <br />
        <br />
        {trip_items && <Schedule scheduleItems={trip_items} />}
        <br />
        <Remarks />
        <br />
        <Recap
          on_duty_hours={on_duty_hours}
          on_duty_hours_last_seven_days={on_duty_hours_last_seven_days}
          on_duty_hours_last_five_days={on_duty_hours_last_five_days}
          on_duty_hours_last_eight_days={on_duty_hours_last_eight_days}
        />
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
