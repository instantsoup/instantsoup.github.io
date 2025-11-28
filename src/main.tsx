import './styles/index.css';
import './styles/utilities.css';
import './styles/skills.css';
import './styles/race.css';
import './styles/alignment.css';
import './styles/saves.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
