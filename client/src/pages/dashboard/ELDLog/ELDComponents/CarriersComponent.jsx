import React from "react";

const CarriersComponent = () => {
  return (
    <section class="carriers-info">
      <div class="left">
        <div class="total-miles">
          <div class="truck-miles-details">
            <span>Display Box</span>
            <p>Total Miles Driving Today</p>
          </div>
          <div class="truck-miles-details">
            <span>Display Box</span>
            <p>Total Mileage Today</p>
          </div>
        </div>
        <div class="truck-miles-details">
          <span>Display Box</span>
          <p>Truck/Tractor and Trailer Numbers or License Plate(s)/State (show each unit)</p>
        </div>
      </div>
      <div class="right">
        <div>
          <span style={{ fontWeight: "bold" }}>Scheinder National Carriers</span>
          <hr />
          <p>Name of Carrier or Carriers</p>
        </div>
        <div>
          <span style={{ fontWeight: "bold" }}>Green Bay, WI</span>
          <hr />
          <p>Main Office Address</p>
        </div>
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
