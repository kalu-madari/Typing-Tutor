import React from 'react'
import { createRoot } from 'react-dom/client'
import './css/styles.css'
import './css/themes/midnight-indigo.css'
import './css/themes/dark.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
