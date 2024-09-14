import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

export const getCompanies = async () => {
  try {
    const response = await axios.get(`${API_URL}companies/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

export const createCompany = async (companyData) => {
  try {
    const response = await axios.post(`${API_URL}companies/`, companyData);
    return response.data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const getCamps = async () => {
  try {
    const response = await axios.get(`${API_URL}camps/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching camps:', error);
    throw error;
  }
};

export const createCamp = async (campData) => {
  try {
    const response = await axios.post(`${API_URL}camps/`, campData);
    return response.data;
  } catch (error) {
    console.error('Error creating camp:', error);
    throw error;
  }
};

