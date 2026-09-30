import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShortlistProvider } from './context/ShortlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import PostPropertyPage from './pages/PostPropertyPage';
import ComparePage from './pages/ComparePage';
import ShortlistPage from './pages/ShortlistPage';
import ValuationToolPage from './pages/ValuationToolPage';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

import { api } from './services/api';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home'); // home, search, detail, post, compare, shortlist, valuation-tool, seller-dashboard, admin-dashboard
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [searchFilters, setSearchFilters] = useState({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [allProperties, setAllProperties] = useState([]);

  useEffect(() => {
    api.getProperties()
      .then(data => setAllProperties(data))
      .catch(err => console.error("Initial load error:", err));
  }, []);

  const handleSelectProperty = (id) => {
    setSelectedPropertyId(id);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchWithFilters = (filters) => {
    setSearchFilters(filters);
    setCurrentPage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleListingCreated = (newId) => {
    // Refresh properties list
    api.getProperties().then(data => setAllProperties(data));
    setSelectedPropertyId(newId);
    setCurrentPage('detail');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main style={{ flexGrow: 1 }}>
        {currentPage === 'home' && (
          <HomePage
            properties={allProperties}
            onSelectProperty={handleSelectProperty}
            onSearchWithFilters={handleSearchWithFilters}
            onNavigate={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onOpenPostProperty={() => setCurrentPage('post-property')}
          />
        )}

        {currentPage === 'search' && (
          <SearchPage
            initialFilters={searchFilters}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {currentPage === 'detail' && selectedPropertyId && (
          <PropertyDetailPage
            propertyId={selectedPropertyId}
            onBack={() => setCurrentPage('search')}
            onNavigateCompare={() => setCurrentPage('compare')}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {currentPage === 'post-property' && (
          <PostPropertyPage
            onListingCreated={handleListingCreated}
            onCancel={() => setCurrentPage('home')}
          />
        )}

        {currentPage === 'compare' && (
          <ComparePage
            onSelectProperty={handleSelectProperty}
            onNavigateSearch={() => setCurrentPage('search')}
          />
        )}

        {currentPage === 'shortlist' && (
          <ShortlistPage
            onSelectProperty={handleSelectProperty}
            onNavigateSearch={() => setCurrentPage('search')}
            onNavigateCompare={() => setCurrentPage('compare')}
          />
        )}

        {currentPage === 'valuation-tool' && (
          <ValuationToolPage />
        )}

        {currentPage === 'seller-dashboard' && (
          <SellerDashboard
            onNavigatePostProperty={() => setCurrentPage('post-property')}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboard
            onSelectProperty={handleSelectProperty}
          />
        )}
      </main>

      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ShortlistProvider>
        <AppContent />
      </ShortlistProvider>
    </AuthProvider>
  );
}
