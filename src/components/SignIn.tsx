// SignIn.jsx
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/auth/signin`, {
    email: formData.email,
    password: formData.password, // Send plain password (backend will hash it)
  });
  localStorage.setItem("userId", response.data.userId);
    console.log("Sign Up Successful");
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
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Sign In</button>
    </form>
  );
};

export default SignIn;