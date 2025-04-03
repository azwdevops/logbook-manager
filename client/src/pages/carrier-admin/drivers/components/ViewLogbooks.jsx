import React, { useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import ELDLogUI from "@/components/shared/ELDLog/ELDLogUI";

const ViewLogbooks = (props) => {
  const { openViewLogbooks, setOpenViewLogbooks, currentDriver } = props;

  const dispatch = useDispatch();

  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const [logbooksList, setLogbooksList] = useState([]);

  // States for controlling the visibility of different UI components
  const [openELDLog, setOpenELDLog] = useState(false);

  const [selectedLogbookId, setSelectedLogbookId] = useState(null);

  const getLogbooksData = async () => {
    dispatch(toggleLoading(true));
    await API.post(`/logbook/get-driver-logbooks/`, { startDate, endDate, driverId: currentDriver?.id })
      .then((res) => {
        setLogbooksList(res?.data?.logbooks_data);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  const handleOpenELDLog = (logbookId) => {
    setSelectedLogbookId(logbookId);
    setOpenELDLog(true);
  };

  return (
    <>
      <CustomModal isOpen={openViewLogbooks} maxWidth="800px" maxHeight="700px">
        <div className="dialog">
          <h3>
            View{" "}
            <span className="green">
              {currentDriver?.driver_number} {currentDriver?.first_name} {currentDriver?.last_name}
            </span>{" "}
            logbooks
          </h3>
          <div className="dialog-row">
            <span>
              <label htmlFor="">Start Date</label>
              <input type="date" onChange={(e) => setStartDate(e.target.value)} value={startDate} required />
            </span>
            <span>
              <label htmlFor="">End Date</label>
              <input type="date" onChange={(e) => setEndDate(e.target.value)} value={endDate} required />
            </span>
          </div>
          {logbooksList?.length > 0 && (
            <table className="table-listing" rules="all" border="1">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {logbooksList?.map((item) => (
                  <tr key={item?.id}>
                    <td>{moment(item?.logbook_date).format("LL")}</td>
                    <td className="button-span" onClick={() => handleOpenELDLog(item?.id)}>
                      View
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="form-buttons">
            <button type="button" onClick={() => setOpenViewLogbooks(false)}>
              Close
            </button>
            <button type="button" onClick={getLogbooksData}>
              Get Logbooks
            </button>
          </div>
        </div>
      </CustomModal>
      {openELDLog && <ELDLogUI openELDLog={openELDLog} setOpenELDLog={setOpenELDLog} selectedLogbookId={selectedLogbookId} />}
    </>
  );
};

export default ViewLogbooks;
