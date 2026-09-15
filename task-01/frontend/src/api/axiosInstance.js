import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ecommerce-backend-qd2t38l66-sashini.vercel.app/api',
});

export default API;