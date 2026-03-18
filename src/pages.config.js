/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ActivatorActivate from './pages/ActivatorActivate';
import ActivatorDashboard from './pages/ActivatorDashboard';
import ActivatorHistory from './pages/ActivatorHistory';
import ActivatorHome from './pages/ActivatorHome';
import ActivatorOpportunities from './pages/ActivatorOpportunities';
import ActivatorWallet from './pages/ActivatorWallet';
import AdminDashboard from './pages/AdminDashboard';
import Alerts from './pages/Alerts';
import ApiDashboard from './pages/ApiDashboard';
import Assistance from './pages/Assistance';
import CGU from './pages/CGU';
import Favorites from './pages/Favorites';
import FlashSaleDetail from './pages/FlashSaleDetail';
import FlashSales from './pages/FlashSales';
import Home from './pages/Home';
import LiveScanner from './pages/LiveScanner';
import Messages from './pages/Messages';
import OllamaStudio from './pages/OllamaStudio';
import Onboarding from './pages/Onboarding';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import OpportunityEngine from './pages/OpportunityEngine';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Profile from './pages/Profile';
import PublishProduct from './pages/PublishProduct';
import PublishRequest from './pages/PublishRequest';
import PublishService from './pages/PublishService';
import Referral from './pages/Referral';
import ServiceDetail from './pages/ServiceDetail';
import ServiceRequests from './pages/ServiceRequests';
import Services from './pages/Services';
import Subscription from './pages/Subscription';


export const PAGES = {
    "ActivatorActivate": ActivatorActivate,
    "ActivatorDashboard": ActivatorDashboard,
    "ActivatorHistory": ActivatorHistory,
    "ActivatorHome": ActivatorHome,
    "ActivatorOpportunities": ActivatorOpportunities,
    "ActivatorWallet": ActivatorWallet,
    "AdminDashboard": AdminDashboard,
    "Alerts": Alerts,
    "ApiDashboard": ApiDashboard,
    "Assistance": Assistance,
    "CGU": CGU,
    "Favorites": Favorites,
    "FlashSaleDetail": FlashSaleDetail,
    "FlashSales": FlashSales,
    "Home": Home,
    "LiveScanner": LiveScanner,
    "Messages": Messages,
    "OllamaStudio": OllamaStudio,
    "Onboarding": Onboarding,
    "Opportunities": Opportunities,
    "OpportunityDetail": OpportunityDetail,
    "OpportunityEngine": OpportunityEngine,
    "ProductDetail": ProductDetail,
    "Products": Products,
    "Profile": Profile,
    "PublishProduct": PublishProduct,
    "PublishRequest": PublishRequest,
    "PublishService": PublishService,
    "Referral": Referral,
    "ServiceDetail": ServiceDetail,
    "ServiceRequests": ServiceRequests,
    "Services": Services,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};