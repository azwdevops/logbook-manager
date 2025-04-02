// Importing necessary components and utilities
import React, { useEffect, useState } from "react"; // React library and useState, useEffect hooks
import AddTruck from "./components/AddTruck"; // Component to add a new truck
import API from "@/utils/API"; // API utility for making HTTP requests
import { showError } from "@/utils"; // Utility function to display error messages
import { useDispatch } from "react-redux"; // Hook to dispatch Redux actions
import { toggleLoading } from "@/redux/features/sharedSlice"; // Redux action to toggle loading state
import EditTruck from "./components/EditTruck"; // Component to edit an existing truck

// Trucks component definition
const Trucks = () => {
  // Using Redux dispatch to dispatch actions
  const dispatch = useDispatch();

  // State variables for managing modal visibility and truck data
  const [openAddTruck, setOpenAddTruck] = useState(false); // Modal visibility for adding a truck
  const [openEditTruck, setOpenEditTruck] = useState(false); // Modal visibility for editing a truck
  const [currentTruck, setCurrentTruck] = useState({}); // Holds the current truck being edited
  const [trucksList, setTrucksList] = useState([]); // List of trucks fetched from the API

  // useEffect to fetch truck data when the component mounts or dispatch changes
  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Show loading state during data fetching
      await API.get(`/logbook/maintain-trucks/`) // API request to get the list of trucks
        .then((res) => {
          // On success, update the trucks list with the fetched data
          setTrucksList(res?.data?.trucks_data);
        })
        .catch((err) => showError(err)) // Handle errors during the API request
        .finally(() => dispatch(toggleLoading(false))); // Hide loading state after the request completes
    };
    fetchData(); // Call fetchData function
  }, [dispatch]); // Dependency on dispatch, so it fetches data on mount

  // Function to open the edit truck modal and set the current truck data
  const handleOpenEditTruck = (truck) => {
    setCurrentTruck(truck); // Set the truck data to be edited
    setOpenEditTruck(true); // Open the edit truck modal
  };

  return (
    <div>
      <h3>Manage Your Trucks</h3> {/* Title of the page */}
      <br />
      <div className="table-parent-buttons">
        {/* Button to open the add truck modal */}
        <button type="button" onClick={() => setOpenAddTruck(true)}>
          Add Truck
        </button>
      </div>
      <br />
      {/* Display the list of trucks if available */}
      {trucksList?.length > 0 ? (
        <table className="table-listing" rules="all" border="1">
          <thead>
            <tr>
              <th>Truck Number</th>
              <th>Trailer Number</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {/* Render each truck in the list */}
            {trucksList?.map((truck) => (
              <tr key={truck?.id}>
                <td>{truck?.truck_number}</td>
                <td>{truck?.trailer_number}</td>
                {/* Button to open the edit truck modal */}
                <td className="button-span" onClick={() => handleOpenEditTruck(truck)}>
                  Edit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // If no trucks are available, show a message
        <h4 className="not-available">No trucks added yet</h4>
      )}
      {/* Conditionally render the AddTruck modal */}
      {openAddTruck && (
        <AddTruck openAddTruck={openAddTruck} setOpenAddTruck={setOpenAddTruck} setTrucksList={setTrucksList} trucksList={trucksList} />
      )}
      {/* Conditionally render the EditTruck modal */}
      {openEditTruck && (
        <EditTruck
          openEditTruck={openEditTruck}
          setOpenEditTruck={setOpenEditTruck}
          setTrucksList={setTrucksList}
          currentTruck={currentTruck}
        />
      )}
    </div>
  );
};

// Exporting the Trucks component for use in other parts of the app
export default Trucks;
