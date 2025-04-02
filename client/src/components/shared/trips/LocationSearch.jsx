import React, { Fragment, useState } from "react"; // Importing necessary React components and hooks

/**
 * LocationSearch component allows users to search for a location and select it from the list of suggestions.
 *
 * @param {Object} props - The component props.
 * @param {string} props.value - Initial value of the search input (optional).
 * @param {Function} props.onSelect - Callback function that is called when a location is selected.
 */
const LocationSearch = ({ value, onSelect }) => {
  const [query, setQuery] = useState(value || ""); // Keep track of user input in the search bar
  const [suggestions, setSuggestions] = useState([]); // Store suggestions fetched from the search API

  /**
   * Handles the search input and fetches location suggestions based on the user's query.
   *
   * @param {string} query - The user's search query.
   */
  const handleSearch = async (query) => {
    setQuery(query); // Update the query state as the user types

    if (!query) {
      setSuggestions([]); // Clear the suggestions if the input is empty
      return;
    }

    // Fetch location suggestions from OpenStreetMap's Nominatim API based on the query
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await response.json(); // Parse the response JSON into data
    setSuggestions(data); // Set the fetched data as the new suggestions
  };

  /**
   * Handles the selection of a location from the suggestions list.
   *
   * @param {string} name - The name of the selected location.
   * @param {Object} coords - The coordinates of the selected location { lat, lng }.
   */
  const handleSelect = (name, coords) => {
    onSelect(name, coords); // Call the onSelect callback with the selected location's name and coordinates
    setQuery(name); // Update the search input with the selected location name
    setSuggestions([]); // Clear the suggestions after selecting a location
  };

  return (
    <Fragment className="location-search">
      <input
        type="text"
        value={query} // Bind the input field to the `query` state (controlled component)
        onChange={(e) => handleSearch(e.target.value)} // Update the query state on input change
        placeholder="Search location..." // Placeholder text in the input field
      />
      {suggestions.length > 0 && (
        // If there are any suggestions, display them in a list
        <ul className="suggestions">
          {suggestions.map((place) => (
            // Loop through suggestions and render each as a list item
            <li
              key={place.place_id} // Use the place ID as the key for each list item
              onClick={() => handleSelect(place.display_name, { lat: parseFloat(place.lat), lng: parseFloat(place.lon) })} // Handle selection when a suggestion is clicked
            >
              {place.display_name} {/* Display the location name */}
            </li>
          ))}
        </ul>
      )}
    </Fragment>
  );
};

export default LocationSearch; // Export the LocationSearch component to be used elsewhere
