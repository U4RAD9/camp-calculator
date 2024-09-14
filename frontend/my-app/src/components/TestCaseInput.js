import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

function TestCaseInput({ companyId, selectedServices, onNext, onBack }) {
  const [caseData, setCaseData] = useState({});

  useEffect(() => {
    const initialData = selectedServices.reduce((acc, service) => {
      acc[service] = {
        casePerDay: 0,
        numberOfDays: 0,
        totalCase: 0,
        reportType: 'digital',
        reportTypeCost: 0,
      };
      return acc;
    }, {});
    setCaseData(initialData);
  }, [selectedServices]);

  const handleChange = (service, field, value) => {
    setCaseData((prev) => {
      const updatedService = { ...prev[service] };

      // Update specific field value
      if (field === 'casePerDay') {
        updatedService.casePerDay = parseInt(value, 10) || 0;
      } else if (field === 'numberOfDays') {
        updatedService.numberOfDays = parseInt(value, 10) || 0;
      } else if (field === 'reportType') {
        updatedService.reportType = value;
      }

      // Recalculate totalCase and reportTypeCost based on updated values
      updatedService.totalCase = updatedService.casePerDay * updatedService.numberOfDays;
      updatedService.reportTypeCost = updatedService.reportType === 'hard copy' ? 50 * updatedService.totalCase : 0;

      return {
        ...prev,
        [service]: updatedService,
      };
    });
  };

  const handleNext = async () => {
    try {
      // Prepare the payload excluding reportTypeCost for the backend
      const backendPayload = Object.entries(caseData).map(([service, data]) => ({
        company_id: companyId,
        service_name: service,
        case_per_day: data.casePerDay,
        number_of_days: data.numberOfDays,
        total_case: data.totalCase,
      }));

      // Send the payload to the backend
      await axios.post('http://127.0.0.1:8000/api/test-case-data/', backendPayload);

      // Pass the caseData including reportTypeCost to the next page
      onNext(caseData);
    } catch (error) {
      console.error('Error saving test case data:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Enter Test Case Details</h2>
      <div className="space-y-4">
        {selectedServices.map((service) => (
          <div key={service} className="space-y-2">
            <h3 className="text-xl">{service}</h3>
            <input
              type="number"
              placeholder="Case Per Day"
              value={caseData[service]?.casePerDay || ''}
              onChange={(e) => handleChange(service, 'casePerDay', e.target.value)}
              className="p-2 border w-full"
              min="0"
              step="1"
            />
            <input
              type="number"
              placeholder="Number of Days"
              value={caseData[service]?.numberOfDays || ''}
              onChange={(e) => handleChange(service, 'numberOfDays', e.target.value)}
              className="p-2 border w-full"
              min="0"
              step="1"
            />
            <div>
              <label htmlFor={`${service}-reportType`} className="block mb-1">
                Report Type
              </label>
              <select
                id={`${service}-reportType`}
                value={caseData[service]?.reportType || 'digital'}
                onChange={(e) => handleChange(service, 'reportType', e.target.value)}
                className="p-2 border w-full"
              >
                <option value="digital">Digital</option>
                <option value="hard copy">Hard Copy</option>
              </select>
            </div>
            <div>Total Case: {caseData[service]?.totalCase || 0}</div>
            {/* Do not display Report Type Cost */}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4">
        <button onClick={handleNext} className="p-2 bg-blue-500 text-white rounded">
          Next
        </button>
        <button onClick={onBack} className="p-2 bg-gray-500 text-white rounded">
          Back
        </button>
      </div>
    </div>
  );
}

TestCaseInput.propTypes = {
  companyId: PropTypes.number.isRequired,
  selectedServices: PropTypes.arrayOf(PropTypes.string).isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default TestCaseInput;
