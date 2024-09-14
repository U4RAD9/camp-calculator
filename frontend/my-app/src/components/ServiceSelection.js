import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ServiceSelection({ companyId, onNext, onBack, userType }) {
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
    'CBC','Complete Hemogram','Hemoglobin','Urine Routine','Stool Examination','Lipid Profile','Kidney Profile','LFT','KFT','Random Blood Glucose','Blood Grouping'
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

    axios.post('http://127.0.0.1:8000/api/serviceselection/', dataToSave)
    .then(response => {
      console.log(response.data.message);
      onNext(dataToSave.selected_services, companyId);
    })
    .catch(error => {
      console.error('There was an error saving the service selections!', error);
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Select Services</h2>
      <div className="space-y-2">
        {services.map(service => (
          <div key={service}>
            <input
              type="checkbox"
              id={service}
              value={service}
              checked={selectedServices.includes(service)}
              onChange={() => handleServiceChange(service)}
            />
            <label htmlFor={service} className="ml-2">{service}</label>
          </div>
        ))}
      </div>

      {selectedServices.includes('Pathology') && (
        <div className="mt-4">
          <h3 className="text-xl mb-2">Select Pathology Sub-Services</h3>
          <div className="space-y-2">
            {pathologySubServices.map(option => (
              <div key={option}>
                <input
                  type="checkbox"
                  id={option}
                  value={option}
                  checked={pathologyOptions.includes(option)}
                  onChange={() => handlePathologyOptionChange(option)}
                />
                <label htmlFor={option} className="ml-2">{option}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="mt-4 p-2 bg-blue-500 text-white"
      >
        Save and Next
      </button>
      <button
        onClick={onBack}
        className="mt-4 ml-4 p-2 bg-gray-500 text-white"
      >
        Back
      </button>
    </div>
  );
}

export default ServiceSelection;
