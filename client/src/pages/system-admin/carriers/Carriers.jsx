import React, { useEffect, useState } from "react";
import AddCarrier from "./components/AddCarrier";
import EditCarrier from "./components/EditCarrier";
import API from "@/utils/API";
import { showError } from "@/utils";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";

const Carriers = () => {
  const dispatch = useDispatch();

  const [carriersList, setCarriersList] = useState([]);

  const [openAddCarrier, setOpenAddCarrier] = useState(false);
  const [openEditCarrier, setOpenEditCarrier] = useState(false);
  const [currentCarrier, setCurrentCarrier] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      await API.get(`/logbook/maintain-carriers/`)
        .then((res) => {
          setCarriersList(res?.data?.carriers_data);
        })
        .catch((err) => showError(err))
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch]);

  const handleOpenEditCarrier = (carrierItem) => {
    setCurrentCarrier(carrierItem);
    setOpenEditCarrier(true);
  };

  return (
    <>
      <div className="">
        <h3>Manage Carriers</h3>
        <br />
        <div className="table-parent-buttons">
          <button type="button" onClick={() => setOpenAddCarrier(true)}>
            Add Carrier
          </button>
        </div>
        <br />
        {carriersList?.length > 0 ? (
          <table className="table-listing" rules="all" border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {carriersList?.map((carrierItem) => (
                <tr key={carrierItem?.id}>
                  <td>{carrierItem?.name}</td>
                  <td className="button-span" onClick={() => handleOpenEditCarrier(carrierItem)}>
                    Edit
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h4 className="not-available">No carriers added yet</h4>
        )}
      </div>
      {openAddCarrier && (
        <AddCarrier
          openAddCarrier={openAddCarrier}
          setOpenAddCarrier={setOpenAddCarrier}
          setCarriersList={setCarriersList}
          carriersList={carriersList}
        />
      )}
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

export default Carriers;
