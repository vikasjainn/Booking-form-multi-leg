import React from 'react';
import ReactDOM from 'react-dom/client'; // Change this line
import App from './App'; // Adjust the path to your main component

// Create a root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
