import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SimpleCostCalculation({ caseData, onSubmit, onBack }) {
  const [priceRanges, setPriceRanges] = useState({});
  const [subserviceCosts, setSubserviceCosts] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch service prices, reporting costs, and subservice costs
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const [priceResponse,subserviceResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/prices/'),
          axios.get('http://127.0.0.1:8000/api/service_costs/'),
        ]);

        const priceData = priceResponse.data.reduce((acc, service) => {
          acc[service.name] = service.price_ranges.map(range => ({
            maxCases: range.max_cases,
            pricePerCase: parseFloat(range.price),
          }));
          return acc;
        }, {});

        const subserviceData = subserviceResponse.data.reduce((acc, service) => {
          if (['CBC', 'Complete Hemogram', 'Hemoglobin', 'Urine Routine', 'Stool Examination', 'Lipid Profile', 'Kidney Profile', 'LFT', 'KFT', 'Random Blood Glucose', 'Blood Grouping'].includes(service.test_type_name)) {
            acc[service.test_type_name] = {
              salary: parseFloat(service.salary),
              incentive: parseFloat(service.incentive),
              misc: parseFloat(service.misc),
              equipment: parseFloat(service.equipment),
              reporting:parseFloat(service.reporting),
            };
          }
          return acc;
        }, {});

        setPriceRanges(priceData);
        setSubserviceCosts(subserviceData);
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching service prices or costs:', error);
      }
    };

    if (!initialized) {
      fetchServiceData();
    }
  }, [initialized]);

  const calculateTotalPrice = (service, totalCase) => {
    if (subserviceCosts.hasOwnProperty(service)) {
      // Calculation for Pathology subservices
      const { salary, incentive, misc, equipment,reporting } = subserviceCosts[service] || {};
      return (salary + incentive + misc + equipment+reporting) * totalCase;
    } 
    else {
      // Regular calculation based on price ranges
      const ranges = priceRanges[service] || [];
      let pricePerCase = 0;

      for (let i = 0; i < ranges.length; i++) {
        if (totalCase <= ranges[i].maxCases) {
          pricePerCase = ranges[i].pricePerCase;
          break;
        }
      }

      return totalCase * pricePerCase;
    }
  };

  const calculateGrandTotal = () => {
    const total = Object.keys(caseData).reduce((total, service) => {
      const totalCase = caseData[service]?.totalCase || 0;
      return total + calculateTotalPrice(service, totalCase);
    }, 0);

    // Apply discount if available
    return total * ((100 - discount) / 100);
  };

  const handleCouponSubmit = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/api/validate-coupon/${couponCode}/`);
      setDiscount(response.data.discount_percentage);
      setError('');
    } catch (error) {
      setDiscount(0);
      setError('Invalid coupon code');
    }
  };

  const handleSubmit = () => {
    const costData = Object.keys(caseData).map(service => ({
      service,
      totalCase: caseData[service]?.totalCase || 0,
      price: calculateTotalPrice(service, caseData[service]?.totalCase || 0),
    }));

    onSubmit(costData);
    navigate('/CoordinatorLogin'); // Redirect to login after submission
  };

  const grandTotal = calculateGrandTotal();

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Cost Calculation</h2>
      <div className="space-y-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3">Test Type</th>
              <th className="px-6 py-3">Total Cases</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(caseData).map(service => {
              const totalCase = caseData[service]?.totalCase || 0;
              return (
                <tr key={service}>
                  <td className="px-6 py-4">{service}</td>
                  <td className="px-6 py-4">{totalCase}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4">
          <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">
            Discount Coupon
          </label>
          <input
            type="text"
            id="coupon"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleCouponSubmit}
            className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Apply Coupon
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="mt-4 flex justify-between">
          <div className="text-lg font-bold">
            Grand Total: ₹{grandTotal.toFixed(2)}
          </div>
        </div>

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
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
}

export default SimpleCostCalculation;
