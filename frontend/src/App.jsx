import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { FavouritesProvider } from './context/FavouritesContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthSlideOver } from './components/auth/AuthSlideOver';
import { LocationModal } from './components/location/LocationModal';
import { Toast } from './components/common/Toast';
import { BottomCartBar } from './components/cart/BottomCartBar';
import { Chatbot } from './components/common/Chatbot';
import { Home } from './pages/Home';
import { Restaurants } from './pages/Restaurants';
import { RestaurantDetails } from './pages/RestaurantDetails';
import { CustomerProfile } from './pages/CustomerProfile';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { LiveOrderBanner } from './components/orders/LiveOrderBanner';
import { Favourites } from './pages/Favourites';
import { SearchPage } from './pages/SearchPage';

// Parse current URL hash for browser history & back/forward arrows navigation
const getTabFromHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return { tab: 'home', restaurantId: null };

  if (hash.startsWith('details/')) {
    const id = parseInt(hash.split('/')[1], 10);
    return { tab: 'details', restaurantId: isNaN(id) ? null : id };
  }

  const validTabs = [
    'home', 'search', 'restaurants', 'details', 'profile', 'cart',
    'checkout', 'orders', 'favourites'
  ];

  if (validTabs.includes(hash)) {
    return { tab: hash, restaurantId: null };
  }
  return { tab: 'home', restaurantId: null };
};

export function AppContent() {
  const initial = getTabFromHash();
  const [activeTab, setActiveTabState] = useState(initial.tab);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(initial.restaurantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOfferFilter, setActiveOfferFilter] = useState(null);
  const [activeTimerOrder, setActiveTimerOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { setIsLocationModalOpen } = useLocation();
  const { showToast } = useAuth();

  const handleSelectOffer = (offerCode) => {
    setActiveOfferFilter(offerCode);
    navigateToTab('search');
  };

  // Primary navigation function syncing state with browser history
  const navigateToTab = (newTab, restaurantId = null, pushState = true) => {
    setActiveTabState(newTab);
    if (restaurantId !== null) {
      setSelectedRestaurantId(restaurantId);
    }

    if (pushState) {
      let hashString = '#' + newTab;
      if (newTab === 'details' && (restaurantId || selectedRestaurantId)) {
        hashString = `#details/${restaurantId || selectedRestaurantId}`;
      }
      if (window.location.hash !== hashString) {
        window.history.pushState({ tab: newTab, restaurantId: restaurantId || selectedRestaurantId }, '', hashString);
      }
    }
  };

  // Synchronize browser Back (←) and Forward (→) arrows
  useEffect(() => {
    const handlePopState = () => {
      const { tab, restaurantId } = getTabFromHash();
      setActiveTabState(tab);
      if (restaurantId !== null) {
        setSelectedRestaurantId(restaurantId);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Initial load: ensure URL has hash for history push/pop
    const currentHash = window.location.hash;
    if (!currentHash || currentHash === '#') {
      window.history.replaceState({ tab: 'home' }, '', '#home');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleSelectRestaurant = (restaurantId) => {
    navigateToTab('details', restaurantId);
  };

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => navigateToTab(tab)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Live Order Banner directly below Navbar */}
      <LiveOrderBanner
        activeTab={activeTab}
        onNavigateToOrderDetails={(orderId) => {
          setSelectedOrderId(orderId);
          navigateToTab('orders');
        }}
      />

      <main className={`main-content ${activeTab === 'home' ? 'main-content-home' : ''}`}>
        {activeTab === 'home' && (
          <Home
            onSelectRestaurant={handleSelectRestaurant}
            onNavigateRestaurants={() => navigateToTab('restaurants')}
            onNavigateSearch={() => navigateToTab('search')}
            onSelectOffer={handleSelectOffer}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'search' && (
          <SearchPage
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectRestaurant={handleSelectRestaurant}
            activeOfferFilter={activeOfferFilter}
            setActiveOfferFilter={setActiveOfferFilter}
          />
        )}

        {activeTab === 'restaurants' && (
          <Restaurants
            onSelectRestaurant={handleSelectRestaurant}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'details' && selectedRestaurantId && (
          <RestaurantDetails
            restaurantId={selectedRestaurantId}
            onBack={() => navigateToTab('restaurants')}
            onNavigateCart={() => navigateToTab('cart')}
          />
        )}

        {activeTab === 'profile' && (
          <CustomerProfile onOpenLocationModal={() => setIsLocationModalOpen(true)} />
        )}

        {activeTab === 'favourites' && (
          <Favourites
            onSelectRestaurant={handleSelectRestaurant}
            onNavigateRestaurants={() => navigateToTab('restaurants')}
          />
        )}

        {activeTab === 'cart' && (
          <Cart
            onNavigateCheckout={() => navigateToTab('checkout')}
            onNavigateRestaurants={() => navigateToTab('restaurants')}
          />
        )}

        {activeTab === 'checkout' && (
          <Checkout
            onOrderPlaced={(createdOrder) => {
              setActiveTimerOrder(createdOrder);
              setSelectedOrderId(createdOrder.id);
              if (createdOrder?.isAppended) {
                showToast(`Items have been added to Order #${createdOrder.id}!`, 'success');
              }
              navigateToTab('orders');
            }}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <Orders
            onSelectRestaurant={handleSelectRestaurant}
            activeTimerOrder={activeTimerOrder}
            selectedOrderId={selectedOrderId}
            onClearSelectedOrder={() => setSelectedOrderId(null)}
          />
        )}
      </main>

      <Footer />

      {/* Floating Bottom Sticky Cart Bar */}
      {activeTab !== 'cart' && activeTab !== 'checkout' && (
        <BottomCartBar
          onNavigateCart={(target) => navigateToTab(target || 'cart')}
          onOrderAppended={(updatedOrder) => {
            setActiveTimerOrder(updatedOrder);
            navigateToTab('orders');
          }}
        />
      )}

      {/* Global Slide-overs, Toast, Modals & Floating AI Chatbot */}
      <Toast />
      <AuthSlideOver />
      <LocationModal />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <LocationProvider>
          <CartProvider>
            <FavouritesProvider>
              <AppContent />
            </FavouritesProvider>
          </CartProvider>
        </LocationProvider>
      </CustomerProvider>
    </AuthProvider>
  );
}
