import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ecommerce-backend-nu.vercel.app/api',
});

export default API;