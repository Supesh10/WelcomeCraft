import './App.css';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import SingleProductPage from './components/SingleProductPage';
import AboutUsPage from './components/AboutUsPage';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ApiService from './services/apiService';

function AppWrapper() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Initialize session on app load
  useEffect(() => {
    ApiService.getSessionId();
  }, []);

  // Admin routes don't show navbar/footer
  if (isAdminRoute) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Add more admin routes here as needed */}
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lotus-white" style={{ backgroundColor: 'var(--lotus-white)' }}>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<SingleProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<AboutUsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;
