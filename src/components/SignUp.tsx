import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/auth/signup`, {
    email: formData.email,
    password: formData.password, // Send plain password (backend will compare it correctly)
  });
  localStorage.setItem("userId", response.data.userId);
  console.log("Sign In Successful");
  navigate("/messaging")
};


  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <input 
        type="email" 
        name="email" 
        placeholder="Email" 
        value={formData.email} 
        onChange={handleChange} 
        className="p-2 border rounded"
        required
      />
      <input 
        type="password" 
        name="password" 
        placeholder="Password" 
        value={formData.password} 
        onChange={handleChange} 
        className="p-2 border rounded"
        required
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">Sign Up</button>
    </form>
  );
};

export default SignUp;
