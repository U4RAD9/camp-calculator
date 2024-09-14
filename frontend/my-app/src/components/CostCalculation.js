import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const defaultCostValues = {
  travel: 0,
  stay: 0,
  food: 0,
};

const serviceCalculationRules = {
  'X-ray': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },
  'ECG': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },
  'Form 7': {
    getSalary: (salary, totalCase) => salary * totalCase,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },
  'CBC': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting) => reporting ,
    getIncentive: (incentive, days) => incentive * days,
  },
  'Complete Hemogram': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting) => reporting,
    getIncentive: (incentive, days) => incentive * days,
  },
 
  'PFT': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },
  'Audiometry': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },
  'Optometry': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },
  'Doctor Consultation': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },
  'Dental Consultation': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },
  'Vitals': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },
  'BMD': {
    getSalary: (salary, days) => salary * days,
    getConsumables: (consumables, totalCase) => consumables * totalCase,
    getReporting: (reporting, totalCase) => reporting * totalCase,
    getIncentive: (incentive, days) => incentive * days,
  },

  
};

function CostCalculation({ caseData, onSubmit, onBack, companyId }) {
  const [costDetails, setCostDetails] = useState({});
  const [initialized, setInitialized] = useState(false);

  // Fetch service costs and initialize costDetails
  useEffect(() => {
    const fetchServiceCosts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/service_costs/');
        const costData = response.data.reduce((acc, cost) => {
          acc[cost.test_type_name] = {
            salary: parseFloat(cost.salary),
            incentive: parseFloat(cost.incentive),
            misc: parseFloat(cost.misc),
            equipment: parseFloat(cost.equipment),
            consumables: parseFloat(cost.consumables),
            reporting: parseFloat(cost.reporting),
          };
          return acc;
        }, {});
        setCostDetails(costData);
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching service costs:', error);
      }
    };

    if (!initialized) {
      fetchServiceCosts();
    }
  }, [initialized]);

  // Initialize the cost details with case data
  useEffect(() => {
    if (initialized) {
      const initialDetails = {};
      Object.keys(caseData).forEach(service => {
        const { totalCase = 0, reportTypeCost = 0, numberOfDays = 0 } = caseData[service] || {};
        initialDetails[service] = {
          ...defaultCostValues,
          ...costDetails[service],
          reportTypeCost,
          totalCase,
          numberOfDays,
          tPrice: ['CBC', 'Complete Hemogram','Hemoglobin','Urine Routine','Stool Examination','Lipid Profile','Kidney Profile','LFT','KFT','Random Blood Glucose','Blood Grouping'].includes(service) ? costDetails[service]?.reporting || 0 : undefined,
        };
      });
      setCostDetails(initialDetails);
    }
  }, [caseData, initialized]);

  const handleChange = (service, field, value) => {
    setCostDetails(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value,
      },
    }));
  };

  const calculateAllDetails = useCallback(() => {
    const details = {};
    Object.keys(caseData).forEach(testType => {
      const { totalCase = 0, numberOfDays = 0, reportTypeCost = 0 } = caseData[testType] || {};
      const rules = serviceCalculationRules[testType] || serviceCalculationRules['default'];

      if (['CBC', 'Complete Hemogram','Hemoglobin','Urine Routine','Stool Examination','Lipid Profile','Kidney Profile','LFT','KFT','Random Blood Glucose','Blood Grouping'].includes(testType)) {
        const tPrice = costDetails[testType]?.reporting|| 0; // Editable total price for CBC and Complete Hemogram
        details[testType] = {
          salary: 0,
          incentive: 0,
          consumables: 0,
          reporting: tPrice, // Use reporting as the total price
          misc: 0,
          equipment: 0,
          travel: 0,
          stay: 0,
          food: 0,
          reportTypeCost,
          overhead: 0,
          tPrice,
          unitPrice:  tPrice ,
        };
      } else {
        const salary = rules.getSalary(costDetails[testType]?.salary || 0, testType === 'Form 7' ? totalCase : numberOfDays);
        const consumables = rules.getConsumables(costDetails[testType]?.consumables || 0, totalCase);
        const reporting = rules.getReporting(costDetails[testType]?.reporting || 0, totalCase);
        const incentive = rules.getIncentive(costDetails[testType]?.incentive || 0, numberOfDays);
        const misc = costDetails[testType]?.misc || 0;
        const equipment = costDetails[testType]?.equipment || 0;
        const travel = costDetails[testType]?.travel || 0;
        const stay = costDetails[testType]?.stay || 0;
        const food = costDetails[testType]?.food || 0;

        const overhead = (salary + incentive + misc + equipment + reportTypeCost + consumables + reporting + travel + stay + food) * 1.5;
        const tPrice = overhead * 1.3;

        details[testType] = {
          salary,
          incentive,
          consumables,
          reporting,
          misc,
          equipment,
          travel,
          stay,
          food,
          reportTypeCost,
          overhead,
          tPrice,
          unitPrice: totalCase ? tPrice / totalCase : 0,
        };
      }
    });
    return details;
  }, [caseData, costDetails,serviceCalculationRules]);

  const allDetails = calculateAllDetails();

  const handleSubmit = async () => {
    try {
      const finalDetails = calculateAllDetails();
      await axios.post('http://127.0.0.1:8000/api/cost_details/', {
        companyId,
        costDetails: Object.keys(finalDetails).reduce((acc, service) => {
          const { travel, stay, food, salary, misc, equipment, consumables, reporting,  } = finalDetails[service];
          acc[service] = {
            travel,
            stay,
            food,
            salary,
            misc,
            equipment,
            consumables,
            reporting,
            
          };
          return acc;
        }, {})
      });
      onSubmit(finalDetails); // Pass the final calculated details to onSubmit
    } catch (error) {
      console.error('Error submitting cost details:', error);
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Cost Calculation</h2>
      <div className="space-y-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3">Test Type</th>
              <th className="px-6 py-3">Travel</th>
              <th className="px-6 py-3">Stay</th>
              <th className="px-6 py-3">Food</th>
              <th className="px-6 py-3">Total Cost</th>
              
            </tr>
          </thead>
          <tbody>
            {Object.keys(allDetails).map(service => {
              const details = allDetails[service];
              return (
                <tr key={service}>
                  <td className="px-6 py-4">{service}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={costDetails[service]?.travel }
                      onChange={e => handleChange(service, 'travel', +e.target.value)}
                      className="p-2 border"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={costDetails[service]?.stay }
                      onChange={e => handleChange(service, 'stay', +e.target.value)}
                      className="p-2 border"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={costDetails[service]?.food }
                      onChange={e => handleChange(service, 'food', +e.target.value)}
                      className="p-2 border"
                    />
                  </td>
                  <td className="px-6 py-4">
                  {service === 'CBC' || service === 'Complete Hemogram' || service === 'Hemoglobin' || service === 'Urine Routine' || service === 'Stool Examination' || service === 'Lipid Profile' || service === 'Kidney Profile' || service === 'LFT' || service === 'KFT' || service === 'Random Blood Glucose' || service === 'Blood Grouping' ? (
  <input
    type="number"
    value={costDetails[service]?.tPrice }
    onChange={e => handleChange(service, 'tPrice', +e.target.value)}
    className="p-2 border"
  />
) : (
  details.tPrice.toFixed(2)
)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={onBack}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default CostCalculation;


