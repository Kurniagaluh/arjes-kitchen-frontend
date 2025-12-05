import axios from 'axios';

const api = axios.create({
  // PENTING: Arahkan ke Port 8000 (Laravel) dan tambahkan '/api' di belakangnya
  baseURL: 'http://127.0.0.1:8000/api', 
  
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json" // Biar Laravel tau kita minta data JSON, bukan HTML
  }
});

export default api;