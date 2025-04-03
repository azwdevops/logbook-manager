import React, { useEffect, useState } from "react";
import AddDriver from "./components/AddDriver";
import API from "@/utils/API";
import { showError } from "@/utils";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import EditDriver from "./components/EditDriver";
import ViewLogbooks from "./components/ViewLogbooks";

/**
 * Drivers component manages the list of drivers.
 * It allows adding new drivers, editing existing ones, and displaying the list.
 */
const Drivers = () => {
  const dispatch = useDispatch(); // Hook to dispatch Redux actions

  // State to control the Add Driver modal
  const [openAddDriver, setOpenAddDriver] = useState(false);

  // State to control the Edit Driver modal
  const [openEditDriver, setOpenEditDriver] = useState(false);

  // State to hold the current driver being edited
  const [currentDriver, setCurrentDriver] = useState({});

  // State to store the list of drivers
  const [driversList, setDriversList] = useState([]);

  const [openViewLogbooks, setOpenViewLogbooks] = useState(false);

  /**
   * Fetches the list of drivers when the component mounts.
   */
  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Set loading state to true

      await API.get(`/users/maintain-drivers/`)
        .then((res) => {
          setDriversList(res?.data?.drivers_data); // Update drivers list state
        })
        .catch((err) => showError(err)) // Handle errors
        .finally(() => dispatch(toggleLoading(false))); // Set loading state to false
    };

    fetchData();
  }, [dispatch]);

  /**
   * Opens the Edit Driver modal and sets the current driver details.
   */
  const handleOpenEditDriver = (driver) => {
    setCurrentDriver(driver);
    setOpenEditDriver(true);
  };

  const handleOpenViewLogbooks = (driver) => {
    setCurrentDriver(driver);
    setOpenViewLogbooks(true);
  };

  return (
    <div>
      <h3>Manage Your Drivers</h3>
      <br />

      {/* Button to open Add Driver modal */}
      <div className="table-parent-buttons">
        <button type="button" onClick={() => setOpenAddDriver(true)}>
          Add Driver
        </button>
      </div>
      <br />

      {/* Display drivers list if available, else show a message */}
      {driversList?.length > 0 ? (
        <table className="table-listing" rules="all" border="1">
          <thead>
            <tr>
              <th>Name</th>
              <th>Driver Number</th>
              <th>Edit</th>
              <th>Logbooks</th>
            </tr>
          </thead>
          <tbody>
            {driversList?.map((driver) => (
              <tr key={driver?.id}>
                <td>
                  {driver?.first_name} {driver.last_name}
                </td>
                <td>{driver?.driver_number}</td>
                {/* Clicking Edit triggers the edit modal */}
                <td className="button-span" onClick={() => handleOpenEditDriver(driver)}>
                  Edit
                </td>
                <td className="button-span" onClick={() => handleOpenViewLogbooks(driver)}>
                  View Logbooks
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h4 className="not-available">No drivers added yet</h4>
      )}

      {/* Render AddDriver modal when open */}
      {openAddDriver && (
        <AddDriver
          openAddDriver={openAddDriver}
          setOpenAddDriver={setOpenAddDriver}
          setDriversList={setDriversList}
          driversList={driversList}
        />
      )}

      {/* Render EditDriver modal when open */}
      {openEditDriver && (
        <EditDriver
          openEditDriver={openEditDriver}
          setOpenEditDriver={setOpenEditDriver}
          setDriversList={setDriversList}
          currentDriver={currentDriver}
        />
      )}
      {openViewLogbooks && (
        <ViewLogbooks openViewLogbooks={openViewLogbooks} setOpenViewLogbooks={setOpenViewLogbooks} currentDriver={currentDriver} />
      )}
    </div>
  );
};

export default Drivers;
