import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx';
import ScrollToTop from './components/profile/scrollToTop';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import './App.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <App />
            <ToastContainer position="top-right" autoClose={3000} />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
