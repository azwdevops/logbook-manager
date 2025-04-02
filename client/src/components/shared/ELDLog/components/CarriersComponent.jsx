import React from "react";

/**
 * CarriersComponent - A component that displays information about a carrier's daily mileage and other details.
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.total_miles_driving_today - The total miles driven today.
 * @param {number} props.mileage_covered_today - The total mileage covered today.
 * @param {string} props.truck_trailer_number - The truck and trailer number or license plate.
 * @param {string} props.carrier_name - The name of the carrier.
 */
const CarriersComponent = ({ total_miles_driving_today, mileage_covered_today, truck_trailer_number, carrier_name }) => {
  return (
    <section class="carriers-info">
      <div class="left">
        {/* Section displaying total miles driven and mileage covered today */}
        <div class="total-miles">
          {/* Total miles driven today */}
          <div class="truck-miles-details">
            <span>{total_miles_driving_today}</span>
            <p>Total Miles Driving Today</p>
          </div>
          {/* Total mileage covered today */}
          <div class="truck-miles-details">
            <span>{mileage_covered_today}</span>
            <p>Total Mileage Today</p>
          </div>
        </div>
        {/* Truck/trailer number or license plate details */}
        <div class="truck-miles-details">
          <span>{truck_trailer_number}</span>
          <p>Truck/Tractor and Trailer Numbers or License Plate(s)/State (show each unit)</p>
        </div>
      </div>
      <div class="right">
        {/* Carrier name section */}
        <div>
          <span style={{ fontWeight: "bold" }}>{carrier_name}</span>
          <hr />
          <p>Name of Carrier or Carriers</p>
        </div>
        {/* Main office address section */}
        <div>
          <span style={{ fontWeight: "bold" }}>Green Bay, WI</span>
          <hr />
          <p>Main Office Address</p>
        </div>
        {/* Home terminal address section */}
        <div>
          <span style={{ fontWeight: "bold" }}>Green Bay, WI</span>
          <hr />
          <p>Home Terminal Address</p>
        </div>
      </div>
    </section>
  );
};

export default CarriersComponent;
