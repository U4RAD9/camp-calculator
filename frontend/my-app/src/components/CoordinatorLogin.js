import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function CoordinatorLogin({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { username, password } = formData;

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
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (
      username === coordinatorCredentials.username &&
      password === coordinatorCredentials.password
    ) {
      onLogin("Coordinator");
    } else {
      onLogin("Customer");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-richblack-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-white mb-6">Login</h2>
        <form className="flex flex-col gap-y-4" onSubmit={handleOnSubmit}>
          <label className="w-full">
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              Username/Email <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type="text"
              name="username"
              value={username}
              onChange={handleOnChange}
              placeholder="Enter username or email"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
            />
          </label>
          <label className="relative">
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              Password <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleOnChange}
              placeholder="Enter Password"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-12 text-richblack-5"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
          </label>
          <div className="flex flex-col gap-y-2">
            <button
              type="submit"
              className="mt-6 rounded-[8px] bg-indigo-600 py-[8px] px-[12px] font-medium text-white"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CoordinatorLogin;
