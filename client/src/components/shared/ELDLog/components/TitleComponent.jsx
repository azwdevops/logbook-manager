import React from "react"; // Importing React library for creating the component
import moment from "moment"; // Importing moment.js for handling date formatting

/**
 * TitleComponent displays the driver's daily log details, including driver information,
 * trip date, and pickup/dropoff locations.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} trip_date - The date of the trip.
 * @param {string} driver_number - The driver's identification number.
 * @param {string} driver_initials - The driver's initials.
 * @param {string} pickup_location_name - The name of the pickup location.
 * @param {string} dropoff_location_name - The name of the dropoff location.
 */
const TitleComponent = ({ trip_date, driver_number, driver_initials, pickup_location_name, dropoff_location_name }) => {
  return (
    <>
      {/* Title section that contains general trip information */}
      <section class="title-section">
        {/* Column for title of the log */}
        <div class="title-col">
          <h3>Drivers Daily Log</h3> {/* Title of the log */}
          <span>(24 Hours)</span> {/* Duration of the log */}
        </div>
        {/* Column for driver's number */}
        <div className="title-col">
          <p>Driver's Number</p>
          <span style={{ fontWeight: "bold" }}>{driver_number}</span> {/* Displaying driver's number */}
        </div>
        {/* Column for driver's initials */}
        <div className="title-col">
          <p>Driver's Initials</p>
          <span style={{ fontWeight: "bold" }}>{driver_initials}</span> {/* Displaying driver's initials */}
        </div>
        {/* Column for the trip date, formatted using moment.js */}
        <div class="title-col">
          <p className="tc" style={{ fontWeight: "bold" }}>
            {moment(trip_date).format("MM / DD / YYYY")} {/* Formatting trip date */}
          </p>
          <span>(month) (day) (year)</span> {/* Labeling the date format */}
        </div>
        {/* Column with information about the original and duplicate logs */}
        <div class="title-col">
          <h4>Original - file at home terminal.</h4> {/* Information about original file */}
          <span>Duplicate: Driver retains in his/her possession for 8 days.</span> {/* Information about duplicate file */}
        </div>
      </section>
    </>
  );
};

export default TitleComponent; // Exporting the component for use in other parts of the application
