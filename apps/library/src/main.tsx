import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@big-academy/design-system/tokens.css';
import './library.css';
import { App } from './App';
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
