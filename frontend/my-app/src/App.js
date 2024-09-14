import React, { useState } from 'react';
import CoordinatorLogin from './components/CoordinatorLogin';
import CampDetails from './components/CampDetails';
import ServiceSelection from './components/ServiceSelection';
import TestCaseInput from './components/TestCaseInput';
import CostCalculation from './components/CostCalculation';
import CostSummaryScreen from './components/CostSummaryScreen';
import SimpleCostCalculation from './components/SimpleCostCalculation';
import Dashboard from './components/Dashboard';
import { useNavigate } from 'react-router-dom';

function App() {
  const [loginType, setLoginType] = useState(null); // Track login type (Coordinator or Customer)
  const [companyId, setCompanyId] = useState(null);
  const [step, setStep] = useState(1);
  const [campDetails, setCampDetails] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [caseData, setCaseData] = useState({});
  const [costDetails, setCostDetails] = useState({});
  const navigate = useNavigate(); // Define navigate

  const handleLogin = (type) => {
    setLoginType(type);
    if (type === 'Coordinator') {
      setStep(2); // Proceed to Coordinator's flow
    } else if (type === 'Customer') {
      setStep(2); // Start the Customer flow from step 2
    }
  };

  const handleCampDetailsNext = (details) => {
    setCampDetails(details);
    setCompanyId(details.companyId); // Ensure companyId is set here

    if (loginType === 'Coordinator') {
      setStep(3); // Coordinator proceeds to ServiceSelection
    } else if (loginType === 'Customer') {
      setStep(3); // Customer also proceeds to ServiceSelection
    }
  };

  const handleServiceSelectionNext = (services) => {
    setSelectedServices(services);
    console.log(services);

    if (loginType === 'Coordinator') {
      setStep(4); // Coordinator proceeds to TestCaseInput
    } else if (loginType === 'Customer') {
      setStep(4); // Customer proceeds to TestCaseInput
    }
  };

  const handleTestCaseInputNext = (data) => {
    setCaseData(data);
    console.log(data);

    if (loginType === 'Coordinator') {
      setStep(5); // Coordinator proceeds to CostCalculation
    } else if (loginType === 'Customer') {
      setStep(8); // Customer proceeds to SimpleCostCalculation
    }
  };

  const handleCostCalculationNext = (details) => {
    setCostDetails(details);
    console.log(details);
    setStep(6);
  };

  const handleFinalSubmit = () => {
    // Reset all state variables
    setLoginType(null);
    setCompanyId(null);
    setCampDetails({});
    setSelectedServices([]);
    setCaseData({});
    setCostDetails({});

    // Ensure that the screen and URL change
    navigate('/CoordinatorLogin');
  };

  const handleBack = () => {
    setStep(prevStep => (prevStep === 2 ? 1 : Math.max(prevStep - 1, 1)));
  };

  const handleLogout = () => {
    // Clear any authentication tokens or cookies here (if applicable)
    localStorage.removeItem('authToken'); // Example for local storage token

    // Reset state and navigate to login
    setLoginType(null);
    setCompanyId(null);
    setCampDetails({});
    setSelectedServices([]);
    setCaseData({});
    setCostDetails({});
    navigate('http://localhost:3000/CoordinatorLogin');
  };

  return (
    <div className="container mx-auto p-4">
      {/* Logout button only on the CostSummaryScreen */}
      {step === 6 && (
        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded shadow hover:bg-red-700">
          Logout
        </button>
      )}
      {step === 1 && <CoordinatorLogin onLogin={handleLogin} />}
      {loginType === 'Coordinator' && (
        <>
          {step === 2 && <CampDetails onNext={handleCampDetailsNext} onBack={handleBack} />}
          {step === 3 && <ServiceSelection companyId={companyId} userType={loginType} onNext={handleServiceSelectionNext} onBack={handleBack} />}
          {step === 4 && <TestCaseInput selectedServices={selectedServices} companyId={companyId} onNext={handleTestCaseInputNext} onBack={handleBack} />}
          {step === 5 && <CostCalculation caseData={caseData} companyId={companyId} onSubmit={handleCostCalculationNext} onBack={handleBack} />}
          {step === 6 && (
            <CostSummaryScreen
              caseData={caseData}
              costDetails={costDetails}
              companyId={companyId}
              campDetails={campDetails}
              onSubmit={handleFinalSubmit}
              onBack={handleBack}
            />
          )}
          {step === 7 && <Dashboard />}
        </>
      )}
      {loginType === 'Customer' && (
        <>
          {step === 2 && <CampDetails onNext={handleCampDetailsNext} onBack={handleBack} />}
          {step === 3 && <ServiceSelection companyId={companyId} userType={loginType} onNext={handleServiceSelectionNext} onBack={handleBack} />}
          {step === 4 && <TestCaseInput selectedServices={selectedServices} companyId={companyId} onNext={handleTestCaseInputNext} onBack={handleBack} />}
          {step === 8 && (
            <SimpleCostCalculation
              caseData={caseData}
              onSubmit={handleFinalSubmit} // This could lead to a different step if needed
              onBack={handleBack}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;