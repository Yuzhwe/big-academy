import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@big-academy/design-system/tokens.css';
import './preview.css';

const locale = new URLSearchParams(window.location.search).get('locale');
document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
