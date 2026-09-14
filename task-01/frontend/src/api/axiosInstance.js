import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ecommerce-backend-3h2jzepfi-sashini.vercel.app/',
});

export default API;