import React from "react";

const ScheduleCellFormat = ({ value, horizontalLine = false, verticalLine = false, startDot = false, endDot = false }) => {
  return (
    <div className="cell-container">
      <span className="left-line"></span>
      <span className="middle-line"></span>
      <span className="right-line"></span>
      <input
        type="text"
        className={`cell-input ${horizontalLine ? "horizontal-line" : ""} ${verticalLine ? "vertical-line" : ""}`}
        value={value || ""}
        readOnly
      />
      {horizontalLine && <div className="horizontal-connection"></div>}
      {verticalLine && <div className="vertical-connection"></div>}
    </div>
  );
};

export default ScheduleCellFormat;
