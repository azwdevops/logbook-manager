import React from "react";
import ScheduleCellFormat from "./ScheduleCellFormat";
import "./Schedule.css";

// Sample JSON data
const scheduleItems = [
  {
    item_type: "sleeper berth",
    start_time: "2025-03-26T01:10:00",
    end_time: "2025-03-26T05:00:00",
  },
  {
    item_type: "driving",
    start_time: "2025-03-26T05:00:00",
    end_time: "2025-03-26T09:30:00",
  },
  {
    item_type: "off duty",
    start_time: "2025-03-26T09:30:00",
    end_time: "2025-03-26T14:30:00",
  },
  {
    item_type: "on duty (not driving)",
    start_time: "2025-03-26T14:45:00",
    end_time: "2025-03-26T16:30:00",
  },
];

// Map item types to their row index
const rowMapping = {
  "off duty": 0,
  "sleeper berth": 1,
  driving: 2,
  "on duty (not driving)": 3,
};

// Function to determine start and end cell positions
const getStartEndCellPositions = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const calculateCellIndex = (time) => {
    const hour = time.getHours();
    const minutes = time.getMinutes();

    let cellIndex = hour;
    if (minutes >= 0 && minutes < 15) cellIndex += 0; // Start of hour
    else if (minutes >= 15 && minutes < 30) cellIndex += 0.25;
    else if (minutes >= 30 && minutes < 45) cellIndex += 0.5;
    else if (minutes >= 45) cellIndex += 0.75;

    return Math.floor(cellIndex); // Convert to whole number for column index
  };

  return {
    startCell: calculateCellIndex(startDate),
    endCell: calculateCellIndex(endDate),
  };
};

const Schedule = () => {
  // Initialize grid with empty values and line information
  const scheduleGrid = Array(4)
    .fill()
    .map(() =>
      Array(25).fill({
        value: "",
        horizontalLine: false,
        verticalLine: false,
        startDot: false,
        endDot: false,
      })
    );

  // Populate grid with dots, horizontal, and vertical lines
  scheduleItems.forEach((item, itemIndex) => {
    const rowIndex = rowMapping[item.item_type.toLowerCase()];
    const { startCell, endCell } = getStartEndCellPositions(item.start_time, item.end_time);

    // Mark start and end dots
    scheduleGrid[rowIndex][startCell] = {
      ...scheduleGrid[rowIndex][startCell],
      value: "●",
      startDot: true,
    };
    scheduleGrid[rowIndex][endCell] = {
      ...scheduleGrid[rowIndex][endCell],
      value: "●",
      endDot: true,
    };

    // Add horizontal line for the same status
    for (let col = startCell + 1; col < endCell; col++) {
      scheduleGrid[rowIndex][col] = {
        ...scheduleGrid[rowIndex][col],
        horizontalLine: true,
      };
    }

    // Add vertical line if changing status from previous item
    if (itemIndex > 0) {
      const prevItem = scheduleItems[itemIndex - 1];
      const prevRowIndex = rowMapping[prevItem.item_type.toLowerCase()];
      const prevEndCell = getStartEndCellPositions(prevItem.start_time, prevItem.end_time).endCell;

      if (rowIndex !== prevRowIndex) {
        // Find the column where status changes
        const changeColumn = Math.min(prevEndCell, startCell);

        // Add vertical line
        for (let row = Math.min(rowIndex, prevRowIndex) + 1; row < Math.max(rowIndex, prevRowIndex); row++) {
          scheduleGrid[row][changeColumn] = {
            ...scheduleGrid[row][changeColumn],
            verticalLine: true,
          };
        }
      }
    }
  });

  return (
    <table className="schedule" rules="all" border="1">
      <thead>
        <tr>
          <th></th>
          <th>
            Mid <br /> Night
          </th>
          {Array.from({ length: 23 }, (_, i) => (
            <th key={i}>{i + 1}</th>
          ))}
          <th>
            Mid <br /> Night
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(rowMapping).map((itemType, rowIndex) => (
          <tr key={itemType}>
            <th>
              {rowIndex + 1}. {itemType}
            </th>
            {Array.from({ length: 25 }, (_, colIndex) => (
              <td key={colIndex}>
                <ScheduleCellFormat
                  value={scheduleGrid[rowIndex][colIndex].value}
                  horizontalLine={scheduleGrid[rowIndex][colIndex].horizontalLine}
                  verticalLine={scheduleGrid[rowIndex][colIndex].verticalLine}
                  startDot={scheduleGrid[rowIndex][colIndex].startDot}
                  endDot={scheduleGrid[rowIndex][colIndex].endDot}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Schedule;
