import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const TripSummary = () => {
  const tripData = {
    pickup: "New York, NY",
    dropoff: "Los Angeles, CA",
    distance: "2,800 miles",
    duration: "42 hours",
    stops: ["Chicago, IL", "Denver, CO", "Las Vegas, NV"],
  };

  return (
    <Card sx={{ mt: 4, p: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Trip Summary
        </Typography>
        <Typography>
          <strong>Pickup Location:</strong> {tripData.pickup}
        </Typography>
        <Typography>
          <strong>Dropoff Location:</strong> {tripData.dropoff}
        </Typography>
        <Typography>
          <strong>Estimated Distance:</strong> {tripData.distance}
        </Typography>
        <Typography>
          <strong>Estimated Duration:</strong> {tripData.duration}
        </Typography>
        <Typography>
          <strong>Planned Stops:</strong> {tripData.stops.join(", ")}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TripSummary;
