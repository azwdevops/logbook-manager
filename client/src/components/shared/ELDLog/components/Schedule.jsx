import React, { useState, useEffect } from "react";
import "./Schedule.css"; // Import the CSS file

const rowLabels = ["Off Duty", "Sleeper Berth", "Driving", "On Duty (not driving)"];
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

async function fetchRowsFromAPI() {
  return {
    1: [
      { start: 3, end: 9, nextRow: 4 },
      { start: 16, end: 18, nextRow: 4 },
      { start: 22, end: 23, nextRow: null },
    ],
    2: [
      { start: 12, end: 13, nextRow: 3 },
      { start: 20, end: 22, nextRow: 1 },
    ],
    3: [
      { start: 10, end: 12, nextRow: 2 },
      { start: 13, end: 14, nextRow: 4 },
    ],
    4: [
      { start: 9, end: 10, nextRow: 3 },
      { start: 14, end: 16, nextRow: 1 },
      { start: 18, end: 20, nextRow: 2 },
    ],
  };
}

function Schedule({ scheduleItems }) {
  // const [rowsConfig, setRowsConfig] = useState({});

  useEffect(() => {
    const loadData = async () => {
      // const data = await fetchRowsFromAPI();
      // setRowsConfig(scheduleItems);
    };

    loadData();
  }, []);

  const rows = 4;
  const cols = 24;

  return (
    <div className="schedule-container">
      {/* Time Row */}
      <div className="time-row">
        <div className="time-label empty-cell"></div>
        {timeLabels.map((time, index) => (
          <div key={index} className="time-label">
            {time}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid-container">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const rowNumber = rowIndex + 1;
          return (
            <React.Fragment key={`row-${rowNumber}`}>
              <div className="label-cell">{rowLabels[rowIndex]}</div>
              {Array.from({ length: cols }, (_, colIndex) => {
                const colNumber = colIndex + 0;
                const segment = scheduleItems[rowNumber]?.find((seg) => seg.start_time === colNumber || seg.end_time === colNumber);
                const currentSegmentStart = scheduleItems[rowNumber]?.find((seg) => seg.start_time === colNumber);
                const currentSegmentEnd = scheduleItems[rowNumber]?.find((seg) => seg.end_time === colNumber);
                const isWithinSegment = scheduleItems[rowNumber]?.some((seg) => seg.start_time < colNumber && colNumber < seg.end_time);

                return (
                  <div className="cell" key={`cell-${rowNumber}-${colNumber}`}>
                    {segment && <div className="dot"></div>}
                    {currentSegmentStart && <div className="horizontal-line" style={{ left: "50%" }}></div>}
                    {currentSegmentEnd && (
                      <>
                        <div className="horizontal-line" style={{ right: "50%" }}></div>
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
