import React from "react";
import moment from "moment";

const TitleComponent = ({ trip_date, driver_number, driver_initials, pickup_location_name, dropoff_location_name }) => {
  return (
    <>
      <section class="title-section">
        <div class="title-col">
          <h3>Drivers Daily Log</h3>
          <span>(24 Hours)</span>
        </div>
        <div className="title-col">
          <p>Driver's Number</p>
          <span style={{ fontWeight: "bold" }}>{driver_number}</span>
        </div>
        <div className="title-col">
          <p>Driver's Initials</p>
          <span style={{ fontWeight: "bold" }}>{driver_initials}</span>
        </div>
        <div class="title-col">
          <p className="tc" style={{ fontWeight: "bold" }}>
            {moment(trip_date).format("MM / DD / YYYY")}
          </p>
          <span>(month) (day) (year)</span>
        </div>
        <div class="title-col">
          <h4>Original - file at home terminal.</h4>
          <span>Duplicate: Driver retains in his/her possession for 8 days.</span>
        </div>
      </section>

      <section class="subtitle-section">
        <div>
          From: <span style={{ fontWeight: "bold" }}>{pickup_location_name}</span>
          <hr />
        </div>
        <div>
          To: <span style={{ fontWeight: "bold" }}>{dropoff_location_name}</span>
          <hr />
        </div>
      </section>
    </>
  );
};

export default TitleComponent;
