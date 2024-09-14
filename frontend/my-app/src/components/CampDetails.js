
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createCompany, createCamp } from './api';

const CampDetails = ({ onNext, onBack }) => {
  const [companyName, setCompanyName] = useState('');
  const [companyDistrict, setCompanyDistrict] = useState('');
  const [companyState, setCompanyState] = useState('');
  const [companyPinCode, setCompanyPinCode] = useState('');
  const [companyLandmark, setCompanyLandmark] = useState('');
  const [camps, setCamps] = useState([]);
  const [campLocation, setCampLocation] = useState('');
  const [campDistrict, setCampDistrict] = useState('');
  const [campState, setCampState] = useState('');
  const [campPinCode, setCampPinCode] = useState('');
  const [campLandmark, setCampLandmark] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCamp = () => {
    if (
      campLocation &&
      campDistrict &&
      campState &&
      campPinCode &&
      campLandmark &&
      startDate &&
      endDate
    ) {
      const newCamp = {
        campLocation,
        campDistrict,
        campState,
        campPinCode,
        campLandmark,
        startDate,
        endDate,
      };
      setCamps([...camps, newCamp]);
      setCampLocation('');
      setCampDistrict('');
      setCampState('');
      setCampPinCode('');
      setCampLandmark('');
      setStartDate(null);
      setEndDate(null);
      setError('');
    } else {
      setError('Please fill out all fields before adding a camp.');
    }
  };

  const handleSubmit = async () => {
    if (
      !companyName ||
      !companyDistrict ||
      !companyState ||
      !companyPinCode ||
      !companyLandmark ||
      camps.length === 0
    ) {
      setError('Please fill out all fields and add at least one camp.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create Company
      const companyData = {
        name: companyName,
        district: companyDistrict,
        state: companyState,
        pin_code: companyPinCode,
        landmark: companyLandmark,
      };
      const company = await createCompany(companyData);

      // Create Camps
      await Promise.all(
        camps.map((camp) => {
          const campData = {
            location: camp.campLocation,
            district: camp.campDistrict,
            state: camp.campState,
            pin_code: camp.campPinCode,
            landmark: camp.campLandmark,
            start_date: camp.startDate.toISOString().split('T')[0],
            end_date: camp.endDate.toISOString().split('T')[0],
            company: company.id, // Link camp to created company
          };
          return createCamp(campData);
        })
      );

      // Pass the camp details and company details to the onNext function
      onNext({
        companyName,
        companyDistrict,
        companyState,
        companyPinCode,
        companyLandmark,
        camps,
        companyId: company.id,
      });

    } catch (err) {
      console.error('Error submitting data:', err);
      setError('Failed to submit data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Camp Details</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="text"
        placeholder="Company Name"
        className="border p-2 mb-2 w-full"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Company District"
          className="border p-2 mb-2 w-full"
          value={companyDistrict}
          onChange={(e) => setCompanyDistrict(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company State"
          className="border p-2 mb-2 w-full"
          value={companyState}
          onChange={(e) => setCompanyState(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company Pin Code"
          className="border p-2 mb-2 w-full"
          value={companyPinCode}
          onChange={(e) => setCompanyPinCode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company Landmark"
          className="border p-2 mb-2 w-full"
          value={companyLandmark}
          onChange={(e) => setCompanyLandmark(e.target.value)}
        />
      </div>

      <h3 className="text-xl font-bold mt-4 mb-2">Add Camp</h3>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Camp Location"
          className="border p-2 mb-2 w-full"
          value={campLocation}
          onChange={(e) => setCampLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Camp District"
          className="border p-2 mb-2 w-full"
          value={campDistrict}
          onChange={(e) => setCampDistrict(e.target.value)}
        />
        <input
          type="text"
          placeholder="Camp State"
          className="border p-2 mb-2 w-full"
          value={campState}
          onChange={(e) => setCampState(e.target.value)}
        />
        <input
          type="text"
          placeholder="Camp Pin Code"
          className="border p-2 mb-2 w-full"
          value={campPinCode}
          onChange={(e) => setCampPinCode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Camp Landmark"
          className="border p-2 mb-2 w-full"
          value={campLandmark}
          onChange={(e) => setCampLandmark(e.target.value)}
        />
        <div className="mb-4">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Start Date"
            className="border p-2 mb-2 w-full"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="End Date"
            className="border p-2 mb-2 w-full"
          />
        </div>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleAddCamp}
        >
          Add Camp
        </button>
      </div>

      <h3 className="text-xl font-bold mt-4 mb-2">Camp List</h3>
      <ul className="mb-4">
        {camps.map((camp, index) => (
          <li key={index} className="border p-2 mb-2">
            <div>Location: {camp.campLocation}</div>
            <div>District: {camp.campDistrict}</div>
            <div>State: {camp.campState}</div>
            <div>Pin Code: {camp.campPinCode}</div>
            <div>Landmark: {camp.campLandmark}</div>
            <div>Start Date: {new Date(camp.startDate).toLocaleDateString()}</div>
            <div>End Date: {new Date(camp.endDate).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      <button
        className="bg-gray-500 text-white px-4 py-2 rounded"
        onClick={onBack}
      >
        Back
      </button>
    </div>
  );
};

export default CampDetails;


