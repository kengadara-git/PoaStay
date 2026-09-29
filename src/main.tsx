import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PoaStayProvider } from './context/PoaStayContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PoaStayProvider>
      <App />
    </PoaStayProvider>
  </StrictMode>,
);
