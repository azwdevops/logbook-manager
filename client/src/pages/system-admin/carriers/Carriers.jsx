import React, { useEffect, useState } from "react"; // Importing React and hooks (useEffect, useState)
import AddCarrier from "./components/AddCarrier"; // Importing AddCarrier component for adding new carriers
import EditCarrier from "./components/EditCarrier"; // Importing EditCarrier component for editing carrier details
import API from "@/utils/API"; // Importing custom API utility for making requests
import { showError } from "@/utils"; // Importing utility function to handle errors
import { useDispatch } from "react-redux"; // Importing useDispatch hook to dispatch actions
import { toggleLoading } from "@/redux/features/sharedSlice"; // Importing action to toggle loading state

const Carriers = () => {
  const dispatch = useDispatch(); // Dispatch function to dispatch actions

  // State for managing the list of carriers
  const [carriersList, setCarriersList] = useState([]);

  // States to manage the opening of Add and Edit Carrier modals
  const [openAddCarrier, setOpenAddCarrier] = useState(false);
  const [openEditCarrier, setOpenEditCarrier] = useState(false);

  // State for storing the current carrier to be edited
  const [currentCarrier, setCurrentCarrier] = useState({});

  // useEffect hook to fetch the list of carriers from the API when the component is mounted
  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Start loading
      await API.get(`/logbook/maintain-carriers/`) // API request to fetch carriers
        .then((res) => {
          setCarriersList(res?.data?.carriers_data); // Update carriers list with the fetched data
        })
        .catch((err) => showError(err)) // Handle any errors
        .finally(() => dispatch(toggleLoading(false))); // Stop loading
    };
    fetchData(); // Call the function to fetch data
  }, [dispatch]);

  // Function to handle opening the Edit Carrier modal with the selected carrier data
  const handleOpenEditCarrier = (carrierItem) => {
    setCurrentCarrier(carrierItem); // Set the selected carrier data
    setOpenEditCarrier(true); // Open the Edit Carrier modal
  };

  return (
    <>
      <div className="">
        <h3>Manage Carriers</h3> {/* Heading for the carrier management section */}
        <br />
        <div className="table-parent-buttons">
          {/* Button to open the Add Carrier modal */}
          <button type="button" onClick={() => setOpenAddCarrier(true)}>
            Add Carrier
          </button>
        </div>
        <br />
        {/* Conditionally render the carrier list table if carriers are available */}
        {carriersList?.length > 0 ? (
          <table className="table-listing" rules="all" border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {/* Render each carrier in the carriersList */}
              {carriersList?.map((carrierItem) => (
                <tr key={carrierItem?.id}>
                  <td>{carrierItem?.name}</td> {/* Display carrier name */}
                  <td className="button-span" onClick={() => handleOpenEditCarrier(carrierItem)}>
                    Edit {/* Edit button to open Edit Carrier modal */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h4 className="not-available">No carriers added yet</h4> // Display if no carriers are available
        )}
      </div>
      {/* Conditionally render AddCarrier modal */}
      {openAddCarrier && (
        <AddCarrier
          openAddCarrier={openAddCarrier}
          setOpenAddCarrier={setOpenAddCarrier}
          setCarriersList={setCarriersList}
          carriersList={carriersList}
        />
      )}
      {/* Conditionally render EditCarrier modal */}
      {openEditCarrier && (
        <EditCarrier
          openEditCarrier={openEditCarrier}
          setOpenEditCarrier={setOpenEditCarrier}
          currentCarrier={currentCarrier}
          setCarriersList={setCarriersList}
        />
      )}
    </>
  );
};

export default Carriers; // Export the Carriers component as default
