import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './ui/App.tsx';
import '@fontsource/vt323/latin-400.css';
import './ui/style.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
