import React from "react";
import ScheduleCellFormat from "./ScheduleCellFormat";

const Schedule = () => {
  return (
    <table class="schedule" rules="all" border="1">
      <thead>
        <tr>
          <th></th>
          <th>
            Mid <br /> Night
          </th>
          <th>1</th>
          <th>2</th>
          <th>3</th>
          <th>4</th>
          <th>5</th>
          <th>6</th>
          <th>7</th>
          <th>8</th>
          <th>9</th>
          <th>10</th>
          <th>11</th>
          <th>Noon</th>
          <th>1</th>
          <th>2</th>
          <th>3</th>
          <th>4</th>
          <th>5</th>
          <th>6</th>
          <th>7</th>
          <th>8</th>
          <th>9</th>
          <th>10</th>
          <th>11</th>
          <th>
            Mid <br /> Night
          </th>
        </tr>
      </thead>
      <tbody>
        {/* OFF DUTY */}
        <tr>
          <th>1. Off Duty</th>
          {Array.from({ length: 25 }, (_, index) => (
            <td key={index}>
              <ScheduleCellFormat />
            </td>
          ))}
        </tr>

        {/* SLEEPER BERTH */}
        <tr>
          <th>2. Sleeper Berth</th>
          {Array.from({ length: 25 }, (_, index) => (
            <td key={index}>
              <ScheduleCellFormat />
            </td>
          ))}
        </tr>

        {/* DRIVING */}
        <tr>
          <th>3. Driving</th>
          {Array.from({ length: 25 }, (_, index) => (
            <td key={index}>
              <ScheduleCellFormat />
            </td>
          ))}
        </tr>

        {/* ON DUTY (NOT DRIVING) */}
        <tr>
          <th>4. On Duty (Not Driving)</th>
          {Array.from({ length: 25 }, (_, index) => (
            <td key={index}>
              <ScheduleCellFormat />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default Schedule;
