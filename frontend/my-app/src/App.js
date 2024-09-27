import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import CoordinatorLogin from './components/CoordinatorLogin';
import CampDetails from './components/CampDetails';
import ServiceSelection from './components/ServiceSelection';
import TestCaseInput from './components/TestCaseInput';
import CostCalculation from './components/CostCalculation';
import CostSummaryScreen from './components/CostSummaryScreen';
import SimpleCostCalculation from './components/SimpleCostCalculation';
import Dashboard from './components/Dashboard';
import CustomerDashboard from './components/CustomerDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Import your ProtectedRoute component

function App() {
  const [loginType, setLoginType] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [campDetails, setCampDetails] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [caseData, setCaseData] = useState({});
  const [costDetails, setCostDetails] = useState({});

  const navigate = useNavigate();
  
  const isAuthenticated = !!loginType; // Check if the user is authenticated

  const handleLogin = (type) => {
    setLoginType(type);
    if (type === 'Coordinator') {
      navigate('/dashboard');
    } else if (type === 'Customer') {
      navigate('/customer-dashboard'); // Updated to navigate to Customer Dashboard
    }
  };

  const handleCampDetailsNext = (details) => {
    setCampDetails(details);
    setCompanyId(details.companyId);
    navigate('/service-selection');
  };

  const handleServiceSelectionNext = (services) => {
    setSelectedServices(services);
    console.log(services);
    navigate('/test-case-input');
  };

  const handleTestCaseInputNext = (data) => {
    setCaseData(data);
    if (loginType === 'Coordinator') {
      console.log(data);
      navigate('/cost-calculation');
    } else if (loginType === 'Customer') {
      console.log(data);
      navigate('/simple-cost-calculation');
    }
  };

  const handleCostCalculationNext = (details) => {
    setCostDetails(details);
    console.log(details);
    navigate('/cost-summary');
  };

  const handleFinalSubmit = () => {
    setLoginType(null);
    setCompanyId(null);
    setCampDetails({});
    setSelectedServices([]);
    setCaseData({});
    setCostDetails({});
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    handleFinalSubmit();
  };

  return (
    <div className="container mx-auto p-4">
      {window.location.pathname === '/cost-summary' && (
        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded shadow hover:bg-red-700">
          Logout
        </button>
      )}
      <Routes>
        <Route path="/login" element={<CoordinatorLogin onLogin={handleLogin} />} />
        <Route path="/camp-details" element={<CampDetails onNext={handleCampDetailsNext} />} />
        <Route path="/service-selection" element={<ServiceSelection companyId={companyId} userType={loginType} onNext={handleServiceSelectionNext} />} />
        <Route path="/test-case-input" element={<TestCaseInput selectedServices={selectedServices} companyId={companyId} onNext={handleTestCaseInputNext} />} />
        <Route path="/cost-calculation" element={<CostCalculation caseData={caseData} companyId={companyId} onSubmit={handleCostCalculationNext} />} />
        <Route path="/cost-summary" element={<CostSummaryScreen caseData={caseData} costDetails={costDetails} companyId={companyId} campDetails={campDetails} onSubmit={handleFinalSubmit} />} />
        <Route path="/simple-cost-calculation" element={<SimpleCostCalculation caseData={caseData} campDetails={campDetails} onSubmit={handleFinalSubmit} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />} />
        <Route path="/customer-dashboard" element={<ProtectedRoute element={<CustomerDashboard />} isAuthenticated={isAuthenticated} />} /> {/* Added route for Customer Dashboard */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
