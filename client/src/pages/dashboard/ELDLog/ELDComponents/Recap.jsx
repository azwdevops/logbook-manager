import React from "react";

const Recap = () => {
  return (
    <div className="recap">
      <table rules="all" border="1">
        <tr>
          <th colSpan={9}>Recap: Complete at end of day</th>
        </tr>
        <tr>
          <th>On Duty Hours</th>
          <th className="table-divider"></th>
          <th colSpan={3}>70 Hour / 8 Day Drivers</th>
          <th className="table-divider"></th>
          <th colSpan={3}>60 Hour / 7 Day Drivers</th>
        </tr>
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
        <tr>
          <td></td>
          <td className="table-divider"></td>
          <td></td>
          <td></td>
          <td>SAMPLE</td>
          <td className="table-divider"></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
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
        <tr>
          <td colSpan={9} className="more-info">
            If you took 34 consecutive hours off duty you have 60/70 hours available
          </td>
        </tr>
      </table>
    </div>
  );
};

export default Recap;
