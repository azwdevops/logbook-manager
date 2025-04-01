import React, { useEffect, useState } from "react";
import moment from "moment";
import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import { useDispatch } from "react-redux";

const TripSummary = (props) => {
  const { openTripSummary, setOpenTripSummary, selectedTripId } = props;

  const [tripSummaryData, setTripSummaryData] = useState({});

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/logbook/get-trip-summary/${selectedTripId}/`)
        .then((res) => {
          setTripSummaryData(res?.data?.trip_summary_data);
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch, selectedTripId]);

  return (
    <CustomModal isOpen={openTripSummary} maxWidth="1000px" maxHeight="700px">
      <div className="dialog">
        <h3>Trip Summary</h3>
        <table rules="all" border="1">
          <thead>
            <tr>
              <th>Starting Location</th>
              <th>Pickup Location</th>
              <th>Dropoff Location</th>
              <th>Mileage</th>
              <th>Trip Days</th>
              <th>Cycle Used</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{tripSummaryData?.starting_location_name}</td>
              <td>{tripSummaryData?.pickup_location_name}</td>
              <td>{tripSummaryData?.dropoff_location_name}</td>
              <td>{tripSummaryData?.trip_mileage}</td>
              <td>{tripSummaryData?.trip_days_count}</td>
              <td>{tripSummaryData?.cycle_used}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <h3>Stop Locations</h3>
        <table rules="all" border="1">
          <thead>
            <tr>
              <th>Stop Location Name</th>
              <th>Remarks</th>
              <th>Arrival</th>
              <th>Departure</th>
            </tr>
          </thead>
          <tbody>
            {tripSummaryData?.stops?.map((stopItem) => (
              <tr key={stopItem?.id}>
                <td>{stopItem?.stop_location["name"]}</td>
                <td>{stopItem?.stop_type}</td>
                <td>{moment(stopItem?.start_time).format("LLL")}</td>
                <td>{moment(stopItem?.end_time).format("LLL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenTripSummary(false)}>
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default TripSummary;
