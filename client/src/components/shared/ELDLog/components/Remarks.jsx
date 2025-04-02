import React from "react";

/**
 * Remarks - A component that displays remarks related to shipping documents and other instructions.
 */
const Remarks = () => {
  return (
    <div>
      {/* Heading for the Remarks section */}
      <h4>Remarks</h4>
      <div className="remarks">
        {/* Sub-heading for shipping documents section */}
        <h4>Shipping Documents</h4>
        <hr />

        {/* Displaying the manifest number field */}
        <p>DVL of Manifest No.</p>
        <hr />

        {/* Displaying the shipper and commodity field */}
        <p>Shipper & Comodity</p>

        {/* Instruction for entering location and duty change information */}
        <p>Enter name of place you reported and where released from work and when and where each change of duty occurred</p>

        {/* Instruction for using the time standard of home terminal */}
        <p className="time-instructions">Use time standard of home terminal</p>
      </div>
    </div>
  );
};

export default Remarks;
