import React from "react";

/**
 * Recap - A component that displays a recap of the on-duty hours for drivers.
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.on_duty_hours - The on-duty hours today.
 * @param {number} props.on_duty_hours_last_seven_days - The on-duty hours in the last 7 days.
 * @param {number} props.on_duty_hours_last_five_days - The on-duty hours in the last 5 days.
 * @param {number} props.on_duty_hours_last_eight_days - The on-duty hours in the last 8 days.
 */
const Recap = ({ on_duty_hours, on_duty_hours_last_seven_days, on_duty_hours_last_five_days, on_duty_hours_last_eight_days }) => {
  return (
    <div className="recap">
      {/* Table displaying recap of on-duty hours for different time periods */}
      <table rules="all" border="1">
        {/* Title row of the recap table */}
        <tr>
          <th colSpan={9}>Recap: Complete at end of day</th>
        </tr>
        {/* Header row with titles for different columns */}
        <tr>
          <th>On Duty Hours</th>
          <th className="table-divider"></th>
          <th colSpan={3}>70 Hour / 8 Day Drivers</th>
          <th className="table-divider"></th>
          <th colSpan={3}>60 Hour / 7 Day Drivers</th>
        </tr>
        {/* Sub-header row for total 3 & 4, with separate columns for A, B, C for both driver categories */}
        <tr>
          <th>Total 3 & 4</th>
          <th className="table-divider"></th>
          <th>A</th>
          <th>B</th>
          <th>C</th>
          <th className="table-divider"></th>
          <th>A</th>
          <th>B</th>
          <th>C</th>
        </tr>
        {/* Data row displaying actual on-duty hours values for today and previous days */}
        <tr>
          <td>{on_duty_hours}</td>
          <td className="table-divider"></td>
          <td>{on_duty_hours_last_seven_days}</td>
          <td>{70 - on_duty_hours_last_seven_days}</td> {/* Calculating available hours for 70-hour rule */}
          <td>{on_duty_hours_last_five_days}</td>
          <td className="table-divider"></td>
          <td>{on_duty_hours_last_eight_days}</td>
          <td>{60 - on_duty_hours_last_eight_days}</td> {/* Calculating available hours for 60-hour rule */}
          <td>{on_duty_hours_last_seven_days}</td>
        </tr>
        {/* Row explaining the meaning of each column for clarity */}
        <tr>
          <td className="more-info">On duty hours today, Total lines 3 & 4</td>
          <td className="table-divider"></td>
          <td className="more-info">A. Total hours on duty last 7 days including today</td>
          <td className="more-info">B. Total hours available tomorrow 70 Hours minus A</td>
          <td className="more-info">C. Total hours on duty last 5 days including today</td>
          <td className="table-divider"></td>
          <td className="more-info">A. Total hours on duty last 8 days including today</td>
          <td className="more-info">B. Total hours available tomorrow 60 Hours minus A</td>
          <td className="more-info">C. Total hours on duty last 7 days including today</td>
        </tr>
      </table>
    </div>
  );
};

export default Recap;
