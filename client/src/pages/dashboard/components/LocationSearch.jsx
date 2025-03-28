import React, { Fragment, useState } from "react";

const LocationSearch = ({ value, onSelect }) => {
  const [query, setQuery] = useState(value || ""); // Keep track of user input
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async (query) => {
    setQuery(query); // Update the input field as user types

    if (!query) {
      setSuggestions([]); // Clear suggestions if input is empty
      return;
    }

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await response.json();
    setSuggestions(data);
  };

  const handleSelect = (name, coords) => {
    onSelect(name, coords);
    setQuery(name); // Update the input field with the selected location
    setSuggestions([]); // Clear suggestions after selection
  };

  return (
    <Fragment className="location-search">
      <input
        type="text"
        value={query} // Controlled input
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search location..."
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place.display_name, { lat: parseFloat(place.lat), lng: parseFloat(place.lon) })}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </Fragment>
  );
};

export default LocationSearch;
