import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css';

const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  const token = localStorage.getItem('token');
  if (token) {
    init.headers = {
      ...init.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
