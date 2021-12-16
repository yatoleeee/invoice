import React from 'react';
import ReactDOM from 'react-dom';
import { Routes, Route, HashRouter } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';
import App from './App';
import Home from './Home';
import Invoice from './Invoice';
import NewInvoice from './NewInvoice';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route
            index
            element={<Home />}
          />
          <Route path="invoice/" element={<Invoice />} />
          <Route path="new-invoice" element={<NewInvoice />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
