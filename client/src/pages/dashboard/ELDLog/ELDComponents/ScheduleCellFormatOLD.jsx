import React from "react";

const ScheduleCellFormat = () => {
  return (
    <>
      <span className="left-line"></span>
      <span className="middle-line"></span>
      <span className="right-line"></span>
      <input type="text" className="cell-input" value="●" readOnly />
    </>
  );
};

export default ScheduleCellFormat;
