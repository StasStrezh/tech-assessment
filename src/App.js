import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [postcode, setPostcode] = useState('');
  const [postcodeData, setPostcodeData] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem('postcodeHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://api.postcodes.io/postcodes/${postcode}`);
      const { country, longitude, latitude, admin_district } = response.data.result;
      setPostcodeData({ country, longitude, latitude, admin_district });
      addToHistory(postcode);
      setActiveTab('search'); // Switch to the Search tab after submitting
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Postcode not found');
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (postcode) => {
    const newHistory = [...history, postcode];
    setHistory(newHistory);
    localStorage.setItem('postcodeHistory', JSON.stringify(newHistory));
  };

  const removeFromHistory = (index) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    localStorage.setItem('postcodeHistory', JSON.stringify(newHistory));
  };

  const handleHistoryClick = async (postcode) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://api.postcodes.io/postcodes/${postcode}`);
      const { country, longitude, latitude, codes } = response.data.result;
      setPostcodeData({ country, longitude, latitude, codes });
      setActiveTab('search'); // Switch to the Search tab after clicking on history
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Postcode not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>Search</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
        </li>
      </ul>
      {activeTab === 'search' && (
        <div>
          <h1>Postcode Lookup</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Enter UK postcode"
              />
              <button className="btn btn-primary" type="submit" disabled={loading}>Submit</button>
            </div>
          </form>
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}
          {postcodeData && !error && (
            <div>
              <h2>Postcode Details</h2>
              <p>Country: {postcodeData.country}</p>
              <p>Longitude: {postcodeData.longitude}</p>
              <p>Latitude: {postcodeData.latitude}</p>
              <p>Admin District: {postcodeData.codes.admin_district}</p>
            </div>
          )}
        </div>
      )}
      {activeTab === 'history' && (
        <div>
          <h2>History</h2>
          <ul className="list-group">
            {history.map((postcode, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <button className="btn btn-link" onClick={() => handleHistoryClick(postcode)}>{postcode}</button>
                <button className="btn btn-danger" onClick={() => removeFromHistory(index)}>
                  <i className="bi bi-x"></i>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
