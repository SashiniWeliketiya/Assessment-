import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ecommerce-ten-tau-91.vercel.app//api',
});

export default API;