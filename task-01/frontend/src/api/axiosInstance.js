import axios from 'axios';


const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://ecommerce-backend-sooty-five.vercel.app/api' 
  : 'http://localhost:5000/api';

const API = axios.create({
  baseURL: baseURL,
});

export default API;