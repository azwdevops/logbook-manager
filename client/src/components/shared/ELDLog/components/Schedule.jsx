import React from "react";
import "./Schedule.css"; // Import the CSS file

// Row labels (Off Duty, Sleeper Berth, Driving, On Duty (not driving))
const rowLabels = ["Off Duty", "Sleeper Berth", "Driving", "On Duty (not driving)"];

// Time labels for each hour of the day (24 hours format)
const timeLabels = [
  "Mid-Night",
  "1am",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "Noon",
  "1pm",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
];

function Schedule({ scheduleItems = [] }) {
  // Constants defining the grid size
  const rows = 4;
  const cols = 24;

  return (
    <div className="schedule-container">
      {/* Time Row displaying the time labels at the top */}
      <div className="time-row">
        <div className="time-label empty-cell"></div>
        {timeLabels.map((time, index) => (
          <div key={index} className="time-label">
            {time}
          </div>
        ))}
      </div>

      {/* Grid representing the schedule */}
      <div className="grid-container">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const rowNumber = rowIndex + 1;
          return (
            <React.Fragment key={`row-${rowNumber}`}>
              {/* Row label (Off Duty, Sleeper Berth, etc.) */}
              <div className="label-cell">{rowLabels[rowIndex]}</div>
              {Array.from({ length: cols }, (_, colIndex) => {
                const colNumber = colIndex;
                // Finding the segment for the current time cell
                const segment = scheduleItems[rowNumber]?.find((seg) => seg.start_time === colNumber || seg.end_time === colNumber);
                const currentSegmentStart = scheduleItems[rowNumber]?.find((seg) => seg.start_time === colNumber);
                const currentSegmentEnd = scheduleItems[rowNumber]?.find((seg) => seg.end_time === colNumber);
                const isWithinSegment = scheduleItems[rowNumber]?.some((seg) => seg.start_time < colNumber && colNumber < seg.end_time);

                return (
                  <div className="cell" key={`cell-${rowNumber}-${colNumber}`}>
                    {/* Dot for start of a segment */}
                    {segment && <div className="dot"></div>}
                    {/* Horizontal line for start of a segment */}
                    {currentSegmentStart && <div className="horizontal-line" style={{ left: "50%" }}></div>}
                    {/* Horizontal line for end of a segment */}
                    {currentSegmentEnd && (
                      <>
                        <div className="horizontal-line" style={{ right: "50%" }}></div>
                        {/* Vertical line connecting to the next row if a segment transitions */}
                        {currentSegmentEnd.nextRow !== null && (
                          <div
                            className="vertical-line"
                            style={{
                              top: currentSegmentEnd.nextRow > rowNumber ? "50%" : "auto",
                              bottom: currentSegmentEnd.nextRow < rowNumber ? "50%" : "auto",
                              minHeight: `${Math.abs(currentSegmentEnd.nextRow - rowNumber) * 101}%`,
                            }}
                          ></div>
                        )}
                      </>
                    )}
                    {/* Horizontal line indicating a segment spanning multiple columns */}
                    {isWithinSegment && <div className="horizontal-line"></div>}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default Schedule;
