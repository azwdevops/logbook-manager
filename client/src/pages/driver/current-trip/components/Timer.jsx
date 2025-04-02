// Import React and necessary hooks
import React, { useState, useEffect } from "react";

// Timer component to display the elapsed time since a given start time
const Timer = ({ startTime }) => {
  // State to track the elapsed time in seconds
  const [elapsedTime, setElapsedTime] = useState(0);

  // Helper function to format time in HH:MM:SS format
  const formatTime = (seconds) => {
    // Calculate hours, minutes, and seconds
    const hrs = Math.floor(seconds / 3600) // Hours
      .toString()
      .padStart(2, "0"); // Format to always have two digits
    const mins = Math.floor((seconds % 3600) / 60) // Minutes
      .toString()
      .padStart(2, "0"); // Format to always have two digits
    const secs = (seconds % 60) // Seconds
      .toString()
      .padStart(2, "0"); // Format to always have two digits

    // Return the formatted time string
    return `${hrs}:${mins}:${secs}`;
  };

  useEffect(() => {
    // Check if startTime exists, if not return early
    if (!startTime) return;

    // Compute the initial difference in seconds between the current time and start time
    const startTimestamp = new Date(startTime).getTime(); // Convert startTime to timestamp
    const nowTimestamp = new Date().getTime(); // Get current timestamp
    const initialElapsed = Math.max(0, Math.floor((nowTimestamp - startTimestamp) / 1000)); // Calculate initial elapsed time in seconds

    // Set the initial elapsed time
    setElapsedTime(initialElapsed);

    // Set up an interval to update elapsed time every second
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1); // Increment elapsed time by 1 second
    }, 1000);

    // Clean up the interval on component unmount or when startTime changes
    return () => clearInterval(interval);
  }, [startTime]); // Re-run the effect when startTime changes

  return (
    <h4>
      Elapsed Time: <span className="green">{formatTime(elapsedTime)}</span>
    </h4>
  );
};

export default Timer;
