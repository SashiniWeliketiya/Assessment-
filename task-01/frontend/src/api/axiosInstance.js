import axios from 'axios';

const API = axios.create({
  baseURL: 'npx plugins add vercel/vercel-plugin',
});

export default API;