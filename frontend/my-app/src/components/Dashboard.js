import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const apiEndpoints = {
  companies: "http://127.0.0.1:8000/api/companies/",
  camps: "http://127.0.0.1:8000/api/camps/",
  serviceselection: "http://127.0.0.1:8000/api/serviceselection/",
  test_case_data: "http://127.0.0.1:8000/api/test-case-data/",
  cost_details: "http://127.0.0.1:8000/api/cost_details/",
  service_costs: "http://127.0.0.1:8000/api/service_costs/",
  costsummaries: "http://127.0.0.1:8000/api/costsummaries/"
};

const Dashboard = () => {
  const [section, setSection] = useState('companies');
  const [data, setData] = useState([]);
  const [companyName, setCompanyName] = useState('Your Company Name');
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiEndpoints[section]);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, [section]);

  const handleToggle = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen">
      {isSidebarVisible && (
        <aside className="bg-gray-800 text-white w-64 p-4 space-y-4">
          <h2 className="text-xl font-semibold">Navigation</h2>
          <ul>
            {Object.keys(apiEndpoints).map((key) => (
              <li
                key={key}
                className="py-2 px-4 hover:bg-gray-700 rounded cursor-pointer"
                onClick={() => setSection(key)}
              >
                {key.replace(/_/g, ' ').toUpperCase()}
              </li>
            ))}
          </ul>
        </aside>
      )}
      <div className={`flex-1 flex flex-col ${isSidebarVisible ? 'ml-64' : ''}`}>
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{companyName}</h1>
          <button
            onClick={handleToggle}
            className="bg-gray-700 text-white px-4 py-2 rounded transition-transform transform hover:scale-105"
          >
            {isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
        </header>
        <main className="p-6 bg-gray-100 flex-1">
          <h2 className="text-3xl font-semibold mb-4">{section.replace(/_/g, ' ').toUpperCase()}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  {data[0] && Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={index}>
                    {Object.values(item).map((value, idx) => (
                      <td
                        key={idx}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
