import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ServiceSelection({ companyId, onNext,userType }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [pathologyOptions, setPathologyOptions] = useState([]);

  useEffect(() => {
    console.log("User Type:", userType); // Debugging line to check the user type
  }, [userType]);

  const services = [
    'X-ray', 'ECG', 'PFT', 'Audiometry', 'Optometry', 
    'Doctor Consultation', 'Pathology', 'Dental Consultation', 
    'Vitals', 'Form 7', 'BMD'
  ];

  const pathologySubServices = [
    'CBC', 'Complete Hemogram', 'Hemoglobin', 'Urine Routine',
    'Stool Examination', 'Lipid Profile', 'Kidney Profile', 
    'LFT', 'KFT', 'Random Blood Glucose', 'Blood Grouping'
  ];

  const handleServiceChange = (service) => {
    setSelectedServices(prev => {
      const updatedServices = prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service];

      return updatedServices;
    });

    if (service === 'Pathology' && selectedServices.includes(service)) {
      setPathologyOptions([]); // Reset sub-options if Pathology is deselected
    }
  };

  const handlePathologyOptionChange = (option) => {
    setPathologyOptions(prev => {
      const updatedOptions = prev.includes(option)
        ? prev.filter(opt => opt !== option)
        : [...prev, option];

      return updatedOptions;
    });
  };

  const handleSave = () => {
    const filteredServices = selectedServices.filter(service => service !== 'Pathology');
    const dataToSave = {
      company_id: companyId,
      selected_services: [
        ...filteredServices, 
        ...pathologyOptions
      ],
    };

    axios.post('http://15.206.159.215:8000/api/serviceselection/', dataToSave)
    .then(response => {
      console.log(response.data.message);
      onNext(dataToSave.selected_services, companyId);
    })
    .catch(error => {
      console.error('There was an error saving the service selections!', error);
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-200 to-blue-400 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Select Services</h2>
        
        <div className="space-y-4">
          {services.map(service => (
            <div key={service} className="flex items-center">
              <input
                type="checkbox"
                id={service}
                value={service}
                checked={selectedServices.includes(service)}
                onChange={() => handleServiceChange(service)}
                className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-500"
              />
              <label htmlFor={service} className="ml-2 text-lg">{service}</label>
            </div>
          ))}
        </div>

        {selectedServices.includes('Pathology') && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Select Pathology Sub-Services</h3>
            <div className="space-y-2">
              {pathologySubServices.map(option => (
                <div key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    id={option}
                    value={option}
                    checked={pathologyOptions.includes(option)}
                    onChange={() => handlePathologyOptionChange(option)}
                    className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-500"
                  />
                  <label htmlFor={option} className="ml-2">{option}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition duration-300"
          >
            Save and Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServiceSelection;
