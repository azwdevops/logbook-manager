import React from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";

const ELDLog = () => {
  // Sample data (to be replaced with actual log data later)
  const logData = [
    { status: "Off Duty", hours: 6 },
    { status: "Sleeper Berth", hours: 2 },
    { status: "Driving", hours: 10 },
    { status: "On Duty (Not Driving)", hours: 6 },
  ];

  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Driver's Daily Log
      </Typography>

      {/* Log Graph Section */}
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {logData.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.status}</TableCell>
                <TableCell>{"█".repeat(entry.hours * 2)}</TableCell>
                <TableCell>{entry.hours} hrs</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Additional Details */}
      <Box mt={3}>
        <Typography variant="subtitle1">Total Miles Driving Today: 500</Typography>
        <Typography variant="subtitle1">Total Mileage Today: 600</Typography>
        <Typography variant="subtitle1">Shipping Documents: DV123456</Typography>
        <Typography variant="subtitle1">Remarks: No adverse conditions</Typography>
      </Box>
    </Box>
  );
};

export default ELDLog;
