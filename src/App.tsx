import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Trade } from './pages/Trade';
import { Assets } from './pages/Assets';
import { Admin } from './pages/Admin';
import { Airdrop } from './pages/Airdrop';
import { UserCenter } from './pages/UserCenter';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('home');
  const [pageParams, setPageParams] = useState<any>(null);

  const navigate = (page: string, params?: any) => {
    setActivePage(page);
    if (params) setPageParams(params);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'trade':
        return <Trade defaultCoinId={pageParams?.coinId} />;
      case 'assets':
        return <Assets />;
      case 'admin':
        return <Admin />;
      case 'airdrop':
        return <Airdrop />;
      case 'user_center':
        return <UserCenter />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <StoreProvider>
      <Layout activePage={activePage} onNavigate={navigate}>
        {renderPage()}
      </Layout>
    </StoreProvider>
  );
};

export default App;