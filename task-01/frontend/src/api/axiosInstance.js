import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ecommerce-backend-nu-ecru.vercel.app/api',
});

export default API;