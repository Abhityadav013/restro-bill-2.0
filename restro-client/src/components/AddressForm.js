import React, { useState, useEffect } from "react";
import "./AddressForm.css";

const AddressForm = ({ initialData, onAddressChange }) => {
  const [postalCode, setPostalCode] = useState("");
  const [phoneNumber,setPhoneNumber] =useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [place, setPlace] = useState("");
  const [streets, setStreets] = useState([]); // Store street names
  const [street, setSelectedStreet] = useState(""); // Selected street
  const [error, setError] = useState(null);
  const [loadData, setLoadData] = useState(false);
  const [streetSuggestions, setStreetSuggestions] = useState([]); 

  // Set initial data if available
  useEffect(() => {
    if (!loadData && initialData && Object.keys(initialData).length > 0) {
      setPostalCode(initialData.postalCode);
      setHouseNumber(initialData.houseNumber);
      setPlace(initialData.place);
      setSelectedStreet(initialData.street);
      setPhoneNumber(initialData.phoneNumber)
      setLoadData(true);
    }
  }, [loadData, initialData]);

  // Fetch place when postal code changes
  const fetchPlaceByPostalCode = async (postalCode) => {
    if (postalCode.length === 5) {
      // Ensure 5 characters before calling API
      try {
        const response = await fetch(
          `https://api.zippopotam.us/de/${postalCode}`
        );
        if (!response.ok) {
          throw new Error("Invalid postal code");
        }
        const data = await response.json();
        const placeName = data.places[0]["place name"];
        const state = data.places[0]["state"];
        setPlace(`${placeName}, ${state}`);
        setError(null);
        fetchStreetsByPostalCode(postalCode); // Fetch streets after fetching place
      } catch (err) {
        setPlace("");
        setError(err.message);
      }
    }
  };

  // Fetch streets by postal code
  const fetchStreetsByPostalCode = async (postalCode) => {
    const url = `https://overpass-api.de/api/interpreter?data=[out:json];area["postal_code"=${postalCode}]->.searchArea;way(area.searchArea)["highway"]["name"];out%20tags;`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data ) {
        const streetName= data.elements.map(item=> item.tags.name).filter(name=> name)
        console.log('streetName>>>>',streetName)
        setStreets([...new Set(streetName)]);
        setError(null);
      } else {
        setStreets([]);
        setError("No streets found.");
      }
    } catch (err) {
      setStreets([]);
      setError("An error occurred while fetching street data.");
    }
  };

  const handlePostalCodeChange = (e) => {
    const value = e.target.value;
    setPostalCode(value);

    if (value.length === 5) {
      fetchPlaceByPostalCode(value); // Fetch place and streets when postal code is complete
    } else {
      setPlace(""); // Clear place if postal code is not valid
      setStreets([]); // Clear streets
    }
  };

  const handleHouseNumberChange = (e) => {
    setHouseNumber(e.target.value); // Update house number value
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value); // Update house number value
  };

  const handleStreetChange = (e) => {
    const query = e.target.value;
    setSelectedStreet(query); // Update selected street value
    // Filter the streets based on the input query
    const filteredStreets = streets.filter((street) =>
      street.toLowerCase().includes(query.toLowerCase())
    );
    setStreetSuggestions(filteredStreets);
  };

  const handleStreetSelect = (street) => {
    setSelectedStreet(street);
    setStreetSuggestions([]); // Clear suggestions after selecting a street
  };


  // Call onAddressChange to pass data back to parent
  useEffect(() => {
    onAddressChange({ postalCode, place, houseNumber, street,phoneNumber });
  }, [postalCode, place, houseNumber, street, phoneNumber,onAddressChange]);

  return (
    <form className="address-form">
      <div className="form-group">
        <label htmlFor="postalCode" className="form-label">
          Postal Code
        </label>
        <input
          id="postalCode"
          type="text"
          value={postalCode}
          maxLength="5"
          onChange={handlePostalCodeChange}
          placeholder="Enter postal code"
          className="form-input"
        />
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="place" className="form-label">
          Place
        </label>
        <input
          id="place"
          type="text"
          value={place}
          readOnly
          placeholder="Place will auto-fill"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="street" className="form-label">
          Street
        </label>
        <input
          id="street"
          type="text"
          value={street}
          onChange={handleStreetChange}
          placeholder="Start typing street name"
          className="form-input"
        />
        {streetSuggestions.length > 0 && (
          <ul className="suggestions-list">
            {streetSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleStreetSelect(suggestion)}
                className="suggestion-item"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="houseNumber" className="form-label">
          House Number
        </label>
        <input
          id="houseNumber"
          type="text"
          value={houseNumber}
          onChange={handleHouseNumberChange}
          placeholder="Enter house number"
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="phoneNumebr" className="form-label">
          Phone Number
        </label>
        <input
          id="phoneNumber"
          type="text"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Enter phone number"
          className="form-input"
        />
      </div>
    </form>
  );
};

export default AddressForm;
