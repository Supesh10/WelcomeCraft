import './App.css';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
// import SingleProductPage from './components/SingleProductPage';
// import AboutUsPage from './components/AboutUsPage';
// import CartPage from './components/CartPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ApiService from './services/apiService';

function AppWrapper() {
  const location = useLocation();

  // Initialize session on app load
  useEffect(() => {
    ApiService.getSessionId();
  }, []);

  return (
    <div className="min-h-screen bg-lotus-white" style={{ backgroundColor: 'var(--lotus-white)' }}>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          {/* <Route path="/product/:id" element={<SingleProductPage />} /> */}
          {/* <Route path="/about" element={<AboutUsPage />} /> */}
          {/* <Route path="/contact" element={<AboutUsPage />} /> Same page with contact section */}
          {/* <Route path="/cart" element={<CartPage />} /> */}
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
