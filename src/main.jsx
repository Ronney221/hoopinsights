// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // global styles (and Tailwind directives if applicable)

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("No element with id 'root' found");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
