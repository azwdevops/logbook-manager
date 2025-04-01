import React, { useEffect, useState } from "react";
import AddDriver from "./components/AddDriver";
import API from "@/utils/API";
import { showError } from "@/utils";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import EditDriver from "./components/EditDriver";

const Drivers = () => {
  const dispatch = useDispatch();

  const [openAddDriver, setOpenAddDriver] = useState(false);
  const [openEditDriver, setOpenEditDriver] = useState(false);
  const [currentDriver, setCurrentDriver] = useState({});

  const [driversList, setDriversList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/users/maintain-drivers/`)
        .then((res) => {
          setDriversList(res?.data?.drivers_data);
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch]);

  const handleOpenEditDriver = (driver) => {
    setCurrentDriver(driver);
    setOpenEditDriver(true);
  };

  return (
    <div>
      <h3>Manage Your Drivers</h3>
      <br />
      <div className="table-parent-buttons">
        <button type="button" onClick={() => setOpenAddDriver(true)}>
          Add Driver
        </button>
      </div>
      <br />
      {driversList?.length > 0 ? (
        <table className="table-listing" rules="all" border="1">
          <thead>
            <tr>
              <th>Name</th>
              <th>Driver Number</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {driversList?.map((driver) => (
              <tr key={driver?.id}>
                <td>
                  {driver?.first_name} {driver.last_name}
                </td>
                <td>{driver?.driver_number}</td>
                <td className="button-span" onClick={() => handleOpenEditDriver(driver)}>
                  Edit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h4 className="not-available">No drivers added yet</h4>
      )}
      {openAddDriver && (
        <AddDriver
          openAddDriver={openAddDriver}
          setOpenAddDriver={setOpenAddDriver}
          setDriversList={setDriversList}
          driversList={driversList}
        />
      )}
      {openEditDriver && (
        <EditDriver
          openEditDriver={openEditDriver}
          setOpenEditDriver={setOpenEditDriver}
          setDriversList={setDriversList}
          currentDriver={currentDriver}
        />
      )}
    </div>
  );
};

export default Drivers;
