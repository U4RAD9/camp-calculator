import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom"; // Use this for navigation

function CoordinatorLogin({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    companyName: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false); // Manage visibility of signup form
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate(); // Navigation hook

  // Fixed coordinator credentials
  const coordinatorCredentials = {
    username: "campcalculator@123",
    password: "camp15042002",
  };

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage(""); // Reset error message on input change
  };

  const handleSignupChange = (e) => {
    setSignupData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (
      username === coordinatorCredentials.username &&
      password === coordinatorCredentials.password
    ) {
      // Save user role and username in localStorage
      localStorage.setItem("role", "Coordinator");
      localStorage.setItem("username", username);
      onLogin("Coordinator");
      navigate("/dashboard"); // Redirect to coordinator's dashboard
    } else {
      // Handle customer login
      handleCustomerLogin(username, password);
    }
  };

 
  const handleCustomerLogin = async (username, password) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error("Unable to fetch users.");
      }
  
      const users = await response.json();
      const matchedUser = users.find(
        (user) => user.username === username && user.password === password
      );
  
      if (matchedUser) {
        // Store user data in localStorage
        localStorage.setItem("role", "Customer");
        localStorage.setItem("username", matchedUser.username);
        localStorage.setItem("companyName", matchedUser.company_name); // Store the company name
  
        onLogin("Customer");
  
        // Navigate to the coordinator dashboard with the company name
        navigate("/customer-dashboard", {
          state: { companyName: matchedUser.company_name }, // Pass companyName as state
        });
      } else {
        setErrorMessage("Invalid customer credentials.");
      }
    } catch (error) {
      setErrorMessage("Error fetching customer details: " + error.message);
    }
  };
  
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { username, password, companyName } = signupData; // Destructure the data
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          company_name: companyName, // Use the correct key
        }),
      });
  
      if (!response.ok) {
        throw new Error('Signup failed');
      }
  
      alert("Signup successful! You can now log in.");
      setShowSignup(false);
    } catch (error) {
      setErrorMessage("Error during signup: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {showSignup ? "Sign Up" : "Login"}
        </h2>
        {errorMessage && (
          <div className="mb-4 text-red-500 text-sm">{errorMessage}</div>
        )}
        <form
          className="flex flex-col gap-y-5"
          onSubmit={showSignup ? handleSignupSubmit : handleOnSubmit}
        >
          <label className="w-full">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Username/Email <sup className="text-red-500">*</sup>
            </p>
            <input
              required
              type="text"
              name="username"
              value={showSignup ? signupData.username : formData.username}
              onChange={showSignup ? handleSignupChange : handleOnChange}
              placeholder="Enter username or email"
              className="w-full h-12 rounded-md border border-gray-300 p-4 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </label>
          <label className="relative">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Password <sup className="text-red-500">*</sup>
            </p>
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={showSignup ? signupData.password : formData.password}
              onChange={showSignup ? handleSignupChange : handleOnChange}
              placeholder="Enter Password"
              className="w-full h-12 rounded-md border border-gray-300 p-4 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[40px] z-[10] cursor-pointer"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
          </label>

          {showSignup && (
            <label className="w-full">
              <p className="mb-2 text-sm font-semibold text-gray-700">
                Company Name <sup className="text-red-500">*</sup>
              </p>
              <input
                required
                type="text"
                name="companyName"
                value={signupData.companyName}
                onChange={handleSignupChange}
                placeholder="Enter your company name"
                className="w-full h-12 rounded-md border border-gray-300 p-4 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </label>
          )}

          <div className="flex flex-col gap-y-4">
            <button
              type="submit"
              className="mt-6 rounded-md bg-blue-600 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition duration-200"
            >
              {showSignup ? "Sign Up" : "Login"}
            </button>
            <button
              type="button"
              onClick={() => setShowSignup((prev) => !prev)}
              className="mt-2 text-blue-600 underline hover:text-blue-800 transition duration-200"
            >
              {showSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CoordinatorLogin;
