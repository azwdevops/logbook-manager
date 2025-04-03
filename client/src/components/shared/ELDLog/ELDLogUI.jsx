import React, { useEffect, useRef, useState } from "react"; // Importing necessary React hooks
import { useReactToPrint } from "react-to-print"; // Importing hook for print functionality

import TitleComponent from "./components/TitleComponent"; // Importing the TitleComponent for displaying log title

import "./ELDLogUI.css"; // Importing CSS file for styling
import CarriersComponent from "./components/CarriersComponent"; // Importing CarriersComponent to display carrier-related information
import Schedule from "./components/Schedule"; // Importing Schedule component for trip schedule details
import Remarks from "./components/Remarks"; // Importing Remarks component for additional remarks
import Recap from "./components/Recap"; // Importing Recap component for duty hours recap
import CustomModal from "@/components/shared/CustomModal"; // Importing a custom modal component
import API from "@/utils/API"; // Importing API utility for API calls
import { showError } from "@/utils"; // Importing error handling utility
import { useDispatch } from "react-redux"; // Importing useDispatch hook from Redux for state management
import { toggleLoading } from "@/redux/features/sharedSlice"; // Importing action to toggle loading state

/**
 * ELDLogUI component displays the detailed daily log for a specific trip and allows printing of the log.
 * It fetches trip data from the API and displays various components for the driver's log.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} openELDLog - A boolean flag to control whether the modal is open.
 * @param {function} setOpenELDLog - Function to control the state of the modal.
 * @param {number} logbookIndex - The index of the logbook entry.
 */
const ELDLogUI = (props) => {
  const { openELDLog, setOpenELDLog, selectedLogbookId } = props; // Destructuring props

  const printArea = useRef(null); // Reference to the area to be printed

  const [driverLogbook, setDriverLogbook] = useState({}); // State to hold the fetched trip logbook data

  // Destructuring relevant properties from tripLogbook state
  const {
    trip_date,
    driver_initials,
    driver_number,
    pickup_location_name,
    dropoff_location_name,
    logbook_items,
    mileage_covered_today,
    total_miles_driving_today,
    truck_trailer_number,
    on_duty_hours,
    on_duty_hours_last_seven_days,
    on_duty_hours_last_five_days,
    on_duty_hours_last_eight_days,
    carrier_name,
  } = driverLogbook;

  const dispatch = useDispatch(); // Getting dispatch function from Redux

  useEffect(() => {
    // Fetching logbook data when component mounts or when dependencies change
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Dispatching loading action
      await API.get(`/logbook/get-logbook-detail/${selectedLogbookId}/`)
        .then((res) => {
          setDriverLogbook(res?.data?.logbook_data); // Storing fetched data in state
        })
        .catch((err) => {
          showError(err);
          setOpenELDLog(false);
        }) // Handling errors
        .finally(() => dispatch(toggleLoading(false))); // Dispatching loading action to false after request
    };
    fetchData(); // Calling fetchData function
  }, [dispatch, selectedLogbookId]); // Dependencies: dispatch

  const handlePrint = useReactToPrint({
    contentRef: printArea, // Reference to the area to be printed
  });

  return (
    <CustomModal isOpen={openELDLog} maxWidth="1200px" maxHeight="800px">
      {/* Modal containing the daily log details */}
      <div ref={printArea} className="daily-log">
        {/* Title section for trip log */}
        <TitleComponent
          trip_date={trip_date}
          driver_initials={driver_initials}
          driver_number={driver_number}
          pickup_location_name={pickup_location_name}
          dropoff_location_name={dropoff_location_name}
        />
        {/* Carriers section for carrier-related details */}
        <CarriersComponent
          mileage_covered_today={mileage_covered_today}
          total_miles_driving_today={total_miles_driving_today}
          truck_trailer_number={truck_trailer_number}
          carrier_name={carrier_name}
        />
        <br />
        <br />
        {/* Displaying schedule if available */}
        <Schedule scheduleItems={logbook_items} />
        <br />
        {/* Displaying remarks section */}
        <Remarks />
        <br />
        {/* Recap section for duty hours */}
        <Recap
          on_duty_hours={on_duty_hours}
          on_duty_hours_last_seven_days={on_duty_hours_last_seven_days}
          on_duty_hours_last_five_days={on_duty_hours_last_five_days}
          on_duty_hours_last_eight_days={on_duty_hours_last_eight_days}
        />
      </div>
      {/* Modal buttons for closing and printing */}
      <div className="daily-log-buttons">
        <button type="button" onClick={() => setOpenELDLog(false)}>
          Close
        </button>
        <button type="button" onClick={() => handlePrint()}>
          Print/PDF
        </button>
      </div>
    </CustomModal>
  );
};

export default ELDLogUI; // Exporting the ELDLogUI component for use in other parts of the application
