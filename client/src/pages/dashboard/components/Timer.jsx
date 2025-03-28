import React, { useState, useEffect } from "react";

const Timer = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Convert time to HH:MM:SS format
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  useEffect(() => {
    if (!startTime) return;

    // Compute initial difference (in seconds)
    const startTimestamp = new Date(startTime).getTime();
    const nowTimestamp = new Date().getTime();
    const initialElapsed = Math.max(0, Math.floor((nowTimestamp - startTimestamp) / 1000));

    setElapsedTime(initialElapsed);

    // Update timer every second
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <h4>
      Elapsed Time: <span className="green">{formatTime(elapsedTime)}</span>
    </h4>
  );
};

export default Timer;
