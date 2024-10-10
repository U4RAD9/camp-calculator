import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { fetchHardCopyPrices,saveTestCaseData } from './api';
function TestCaseInput({ companyId, selectedServices, onNext }) {
  const [caseData, setCaseData] = useState({});
  const [errors, setErrors] = useState({});
  const [hardCopyPrices, setHardCopyPrices] = useState({});
  const [loading, setLoading] = useState(true);

  const thresholds = {
    'X-ray': 200,
    'ECG': 100,
    'PFT': 200,
    'CBC': 120,
    'pathology': 120,
    'Audiometry':125,
    'Optometry':150,
    'Doctor Consultation':100,
    'Dental Consultation':125,
     'Vitals':150,
     'BMD':150,
     'Tetanus Vaccine':125,
     'Typhoid Vaccine':125

  };

  const pathologyServices = [
    'CBC',
    'Complete Hemogram',
    'Hemoglobin',
    'Urine Routine',
    'Stool Examination',
    'Lipid Profile',
    'Kidney Profile',
    'LFT',
    'KFT',
    'Random Blood Glucose',
    'Blood Grouping',
  ].filter(service => selectedServices.includes(service));

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const prices = await fetchHardCopyPrices();
        setHardCopyPrices(prices);
      } catch (error) {
        // Handle error if needed
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

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
    const intValue = parseInt(value, 10) || 0;

    setCaseData(prev => {
      const updatedService = { ...prev[service] };

      if (field === 'numberOfDays') {
        updatedService.numberOfDays = intValue;
      } else if (field === 'casePerDay') {
        updatedService.casePerDay = intValue;

        const currentThreshold = thresholds[service] * updatedService.numberOfDays;

        if (intValue > currentThreshold) {
          setErrors(prev => ({
            ...prev,
            [service]: `${service} cannot exceed the threshold of ${currentThreshold}.`,
          }));
          return prev;
        } else {
          setErrors(prev => ({ ...prev, [service]: '' }));
        }
      }

      updatedService.totalCase = updatedService.casePerDay * updatedService.numberOfDays;

      return {
        ...prev,
        [service]: updatedService,
      };
    });
  };

  const handleReportTypeChange = (service, value) => {
    setCaseData(prev => {
      const updatedService = { ...prev[service], reportType: value };
  
      if (pathologyServices.includes(service)) {
        // Set the reportTypeCost based on whether it's hard copy or digital
        updatedService.reportTypeCost = value === 'hard copy' 
          ? updatedService.totalCase * 25 // Assuming a flat rate for hard copy
          : 0; // Digital has no additional cost
      } else {
        // For non-pathology services, check if hard copy price is available
        const validHardCopyPrice = hardCopyPrices[service] || 0;
        updatedService.reportTypeCost = value === 'hard copy' && validHardCopyPrice > 0
          ? validHardCopyPrice * updatedService.totalCase
          : 0;
      }
  
      const updatedCaseData = { ...prev };
      pathologyServices.forEach(s => {
        if (s !== service) {
          // Reset report type cost for other pathology services when one is selected
          updatedCaseData[s] = { ...updatedCaseData[s], reportTypeCost: 0 };
        }
      });
  
      return {
        ...updatedCaseData,
        [service]: updatedService,
      };
    });
  };
  

  const handlePathologyChange = (field, value) => {
    const intValue = parseInt(value, 10) || 0;

    pathologyServices.forEach(service => {
      if (field === 'casePerDay' && intValue > (thresholds['CBC'] * (caseData[service]?.numberOfDays || 0))) {
        setErrors(prev => ({
          ...prev,
          [service]: `Pathology case per day cannot exceed the threshold of ${thresholds['CBC'] * (caseData[service]?.numberOfDays || 0)}.`,
        }));
        return;
      } else {
        setErrors(prev => ({ ...prev, [service]: '' }));
      }

      setCaseData(prev => {
        const updatedService = { ...prev[service] };
        if (field === 'casePerDay') {
          updatedService.casePerDay = intValue > (thresholds['CBC'] * (caseData[service]?.numberOfDays || 0)) ? updatedService.casePerDay : intValue;
        } else if (field === 'numberOfDays') {
          updatedService.numberOfDays = intValue;
        }

        updatedService.totalCase = updatedService.casePerDay * updatedService.numberOfDays;

        return {
          ...prev,
          [service]: updatedService,
        };
      });
    });
  };

  const handleNext = async () => {
    console.log("Starting handleNext function...");
  
    // Step 1: Check for validation errors
    if (Object.keys(errors).some(key => errors[key])) {
      console.log("Error found in validation: ", errors);
      alert('Some services have exceeded their threshold limits. Please correct the errors.');
      return;
    }
  
    console.log("No errors found in validation.");
  
    // Step 2: Validate that all fields are filled for selected services
    const allValid = selectedServices.every(service => {
      const data = caseData[service];
      console.log(`Validating service: ${service}, data:`, data);
      return data.casePerDay > 0 && data.numberOfDays > 0;
    });
  
    if (!allValid) {
      console.log("Validation failed: Not all fields are filled.");
      alert('Please fill in all fields before proceeding.');
      return;
    }
  
    console.log("All fields are valid, proceeding...");
  
    // Step 3: Check if all pathology services have digital report type
    const isDigitalReportType = pathologyServices.every(service => caseData[service]?.reportType === 'digital');
    console.log("Checking if pathology services have digital report type:", isDigitalReportType);
  
    if (!isDigitalReportType) {
      console.log("Report type is NOT digital, proceeding with hardcopy logic...");
  
      // Step 4: Check if all pathology services have reportTypeCost of zero
      const allPathologyReportCostsZero = pathologyServices.every(service => (caseData[service]?.reportTypeCost || 0) === 0);
      console.log("All pathology reportTypeCost values are zero:", allPathologyReportCostsZero);
  
      // Step 5: If all pathology subservices have reportTypeCost of 0, assign totalCase * 25 to the last pathology service
      if (allPathologyReportCostsZero && pathologyServices.length > 0) {
        const lastPathologyService = pathologyServices[pathologyServices.length - 1];
        const totalCase = caseData[lastPathologyService]?.totalCase || 0;
  
        console.log(`Attempting to assign reportTypeCost to last pathology service (${lastPathologyService}): totalCase =`, totalCase);
  
        if (totalCase > 0) {
          // Step 6: Update state and pass updated caseData to onNext in the callback
          setCaseData(prev => {
            const updatedCaseData = {
              ...prev,
              [lastPathologyService]: {
                ...prev[lastPathologyService],
                reportTypeCost: totalCase * 25,  // Set reportTypeCost to totalCase * 25
              },
            };
            console.log(`Updated caseData for ${lastPathologyService}:`, updatedCaseData[lastPathologyService]);
  
            // Step 7: Proceed with updated caseData after reportTypeCost update
            console.log("Proceeding with updated caseData after reportTypeCost update:", updatedCaseData);
            onNext(updatedCaseData);  // Ensure the updated state is passed to onNext
            return updatedCaseData;  // This ensures state gets updated properly
          });
        } else {
          console.log(`No totalCase value found for ${lastPathologyService}, skipping reportTypeCost assignment.`);
          onNext(caseData);  // If totalCase is 0, proceed without updating
        }
      } else {
        console.log("No need to modify reportTypeCost, skipping...");
        onNext(caseData);  // Proceed with the existing caseData if no modification needed
      }
    } else {
      console.log("Report type is digital, skipping pathology cost modification.");
      // Step 8: If report type is digital, call onNext directly
      onNext(caseData);
    }
  
    // Step 9: Construct the payload for non-pathology services and send it to the backend
    const backendPayload = Object.entries(caseData).map(([service, data]) => {
      return {
        company_id: companyId,
        service_name: service,
        case_per_day: data.casePerDay,
        number_of_days: data.numberOfDays,
        total_case: data.totalCase,
        report_type_cost: data.reportTypeCost || 0
      };
    });

    try {
      await saveTestCaseData(backendPayload);
    } catch (error) {
      // Handle error if needed
    }
  };
  
  
  return (
    <div className="p-6 bg-richblack-25 rounded-lg shadow-lg transition-transform transform">
    <h2 className="text-3xl font-semibold mb-6 text-center text-richblack-900">Enter Test Case Details</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {pathologyServices.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg shadow-md hover:shadow-xl transition-shadow">
          <h3 className="text-2xl font-semibold mb-4 text-blue-600">Pathology</h3>
          <input
            type="number"
            placeholder="Number of Days"
            onChange={(e) => handlePathologyChange('numberOfDays', e.target.value)}
            className="p-3 border border-richblack-300 rounded w-full mb-4 transition-colors focus:border-blue-600 focus:outline-none"
            min="0"
            step="1"
          />
          <input
            type="number"
            placeholder="Case Per Day"
            onChange={(e) => handlePathologyChange('casePerDay', e.target.value)}
            className={`p-3 border border-richblack-300 rounded w-full mb-4 transition-colors focus:border-blue-600 focus:outline-none ${errors['CBC'] ? 'border-red-500' : ''}`}
            min="0"
            max={thresholds['CBC']}
            step="1"
          />
          {errors['CBC'] && <div className="text-red-500 mb-4">{errors['CBC']}</div>}
          <div>
            <label htmlFor="reportType" className="block text-richblack-700 mb-2">Report Type</label>
            <select
              id="reportType"
              onChange={(e) => {
                pathologyServices.forEach(service => handleReportTypeChange(service, e.target.value));
              }}
              className="p-3 border border-richblack-300 rounded w-full mb-4 transition-colors focus:border-blue-600 focus:outline-none"
            >
              <option value="digital">Digital</option>
              <option value="hard copy">Hard Copy</option>
            </select>
          </div>
          <div className="font-semibold text-blue-600">Total Pathology Cases: {pathologyServices.reduce((total, service) => total + (caseData[service]?.totalCase || 0), 0)}</div>
        </div>
      )}
      {selectedServices.filter(service => !pathologyServices.includes(service)).map(service => (
        <div key={service} className="border border-richblack-300 rounded-lg p-4 bg-caribbeangreen-50 shadow-md hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold mb-2 text-caribbeangreen-600">{service}</h3>
          <div className="flex flex-col space-y-4">
            <input
              type="number"
              placeholder="Number of Days"
              onChange={(e) => handleChange(service, 'numberOfDays', e.target.value)}
              className={`p-3 border border-richblack-300 rounded w-full transition-colors focus:border-caribbeangreen-600 focus:outline-none ${errors[service] ? 'border-red-500' : ''}`}
              min="0"
            />
            <input
              type="number"
              placeholder="Case Per Day"
              onChange={(e) => handleChange(service, 'casePerDay', e.target.value)}
              className={`p-3 border border-richblack-300 rounded w-full transition-colors focus:border-caribbeangreen-600 focus:outline-none ${errors[service] ? 'border-red-500' : ''}`}
              min="0"
            />
          </div>
          {errors[service] && <div className="text-red-500 mb-2">{errors[service]}</div>}
          <div>
            <label htmlFor="reportType" className="block text-richblack-700 mb-2">Report Type</label>
            <select
              id="reportType"
              onChange={(e) => handleReportTypeChange(service, e.target.value)}
              className="p-3 border border-richblack-300 rounded w-full mb-4 transition-colors focus:border-caribbeangreen-600 focus:outline-none"
            >
              <option value="digital">Digital</option>
              <option value="hard copy">Hard Copy</option>
            </select>
          </div>
          <div className="font-semibold text-caribbeangreen-600">Total Cases: {caseData[service]?.totalCase || 0}</div>
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-6">
      <button
        onClick={handleNext}
        className="px-4 py-2 bg-yellow-100 text-richblack-900 rounded hover:bg-yellow-200 transition-colors shadow-md"
      >
        Next
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


