import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Mobile from './Mobile.jsx';
import QrCodePage from './Code.jsx';
import RessourceManagement from './RessourceManagement.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter basename="/">
        <Routes>
            <Route index element={<App />} />
            <Route path="Admin" element={<App />} />
            <Route path="Mobile" element={<Mobile />} />
            <Route path="generate" element={<QrCodePage />} />
            <Route path="ressource-management" element={<RessourceManagement />} />
        </Routes>
    </BrowserRouter>

);
