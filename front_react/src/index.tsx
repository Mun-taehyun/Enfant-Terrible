import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render( //Link , Route 를 하려면 BrowserRouter로 감싸져 있어야한다.. 
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);