import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import ELDLogUI from "@/components/shared/ELDLog/ELDLogUI";

const MyLogbooks = () => {
  const dispatch = useDispatch();

  const userId = useSelector((state) => state?.auth?.user?.id);

  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const [logbooksList, setLogbooksList] = useState([]);

  // States for controlling the visibility of different UI components
  const [openELDLog, setOpenELDLog] = useState(false);

  const [selectedLogbookId, setSelectedLogbookId] = useState(null);

  const getLogbooksData = async () => {
    dispatch(toggleLoading(true));
    await API.post(`/logbook/get-driver-logbooks/`, { startDate, endDate, driverId: userId })
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
      <div style={{ maxWidth: "700px", margin: "auto" }}>
        <div className="dialog-row">
          <span>
            <label htmlFor="">Start Date</label>
            <input type="date" onChange={(e) => setStartDate(e.target.value)} value={startDate} required />
          </span>
          <span>
            <label htmlFor="">End Date</label>
            <input type="date" onChange={(e) => setEndDate(e.target.value)} value={endDate} required />
          </span>
          <span>
            <br />
            <button type="button" className="add-button" onClick={getLogbooksData}>
              Get Logbooks
            </button>
          </span>
        </div>
        <h3>My Logbooks</h3>
        <br />
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
      </div>
      {openELDLog && <ELDLogUI openELDLog={openELDLog} setOpenELDLog={setOpenELDLog} selectedLogbookId={selectedLogbookId} />}
    </>
  );
};

export default MyLogbooks;
