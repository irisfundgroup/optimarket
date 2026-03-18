import React from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { isRTL, getStoredLang } from '@/lib/i18n'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import Services from '@/pages/Services';
import Opportunities from '@/pages/Opportunities';
import FlashSales from '@/pages/FlashSales';
import Alerts from '@/pages/Alerts';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import Subscription from '@/pages/Subscription';
import AdminDashboard from '@/pages/AdminDashboard';
import PublishProduct from '@/pages/PublishProduct';
import PublishService from '@/pages/PublishService';
import PublishRequest from '@/pages/PublishRequest';
import ProductDetail from '@/pages/ProductDetail';
import ServiceDetail from '@/pages/ServiceDetail';
import OpportunityDetail from '@/pages/OpportunityDetail';
import FlashSaleDetail from '@/pages/FlashSaleDetail';
import ServiceRequests from '@/pages/ServiceRequests';
import Favorites from '@/pages/Favorites';
import Onboarding from '@/pages/Onboarding';
import ApiDashboard from '@/pages/ApiDashboard';
import LiveScanner from '@/pages/LiveScanner';
import CGU from '@/pages/CGU';
import Assistance from '@/pages/Assistance';
import Referral from '@/pages/Referral';
import ActivatorDashboard from '@/pages/ActivatorDashboard';
import ActivatorOpportunities from '@/pages/ActivatorOpportunities';
import ActivatorActivate from '@/pages/ActivatorActivate';
import ActivatorWallet from '@/pages/ActivatorWallet';
import ActivatorHistory from '@/pages/ActivatorHistory';
import OpportunityEngine from '@/pages/OpportunityEngine';
import OllamaStudio from '@/pages/OllamaStudio';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center animate-pulse">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="w-8 h-8 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route path="/Onboarding" element={<Onboarding />} />
      <Route element={<AppLayout />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/Products" element={<Products />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/Opportunities" element={<Opportunities />} />
        <Route path="/FlashSales" element={<FlashSales />} />
        <Route path="/Alerts" element={<Alerts />} />
        <Route path="/Messages" element={<Messages />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Subscription" element={<Subscription />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/PublishProduct" element={<PublishProduct />} />
        <Route path="/PublishService" element={<PublishService />} />
        <Route path="/PublishRequest" element={<PublishRequest />} />
        <Route path="/ProductDetail" element={<ProductDetail />} />
        <Route path="/ServiceDetail" element={<ServiceDetail />} />
        <Route path="/OpportunityDetail" element={<OpportunityDetail />} />
        <Route path="/FlashSaleDetail" element={<FlashSaleDetail />} />
        <Route path="/ServiceRequests" element={<ServiceRequests />} />
        <Route path="/Favorites" element={<Favorites />} />
        <Route path="/ApiDashboard" element={<ApiDashboard />} />
        <Route path="/LiveScanner" element={<LiveScanner />} />
        <Route path="/CGU" element={<CGU />} />
        <Route path="/Assistance" element={<Assistance />} />
        <Route path="/Referral" element={<Referral />} />
        <Route path="/ActivatorDashboard" element={<ActivatorDashboard />} />
        <Route path="/ActivatorOpportunities" element={<ActivatorOpportunities />} />
        <Route path="/ActivatorActivate" element={<ActivatorActivate />} />
        <Route path="/ActivatorWallet" element={<ActivatorWallet />} />
        <Route path="/ActivatorHistory" element={<ActivatorHistory />} />
        <Route path="/OpportunityEngine" element={<OpportunityEngine />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  // Apply RTL direction and lang at root level
  React.useEffect(() => {
    const rtl = isRTL();
    const lang = getStoredLang();
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App