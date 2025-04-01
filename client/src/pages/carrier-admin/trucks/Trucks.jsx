import React, { useEffect, useState } from "react";
import AddTruck from "./components/AddTruck";
import API from "@/utils/API";
import { showError } from "@/utils";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import EditTruck from "./components/EditTruck";

const Trucks = () => {
  const dispatch = useDispatch();

  const [openAddTruck, setOpenAddTruck] = useState(false);
  const [openEditTruck, setOpenEditTruck] = useState(false);
  const [currentTruck, setCurrentTruck] = useState({});

  const [trucksList, setTrucksList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/logbook/maintain-trucks/`)
        .then((res) => {
          setTrucksList(res?.data?.trucks_data);
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch]);

  const handleOpenEditTruck = (truck) => {
    setCurrentTruck(truck);
    setOpenEditTruck(true);
  };

  return (
    <div>
      <h3>Manage Your Trucks</h3>
      <br />
      <div className="table-parent-buttons">
        <button type="button" onClick={() => setOpenAddTruck(true)}>
          Add Truck
        </button>
      </div>
      <br />
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
            {trucksList?.map((truck) => (
              <tr key={truck?.id}>
                <td>{truck?.truck_number}</td>
                <td>{truck?.trailer_number}</td>
                <td className="button-span" onClick={() => handleOpenEditTruck(truck)}>
                  Edit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h4 className="not-available">No trucks added yet</h4>
      )}
      {openAddTruck && (
        <AddTruck openAddTruck={openAddTruck} setOpenAddTruck={setOpenAddTruck} setTrucksList={setTrucksList} trucksList={trucksList} />
      )}
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

export default Trucks;
