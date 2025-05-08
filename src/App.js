import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  createRoutesFromElements,
  Route,
  ScrollRestoration,
  useLocation,
  Link,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/home/Footer/Footer";
import FooterBottom from "./components/home/Footer/FooterBottom";
import Header from "./components/home/Header/Header";
import HeaderBottom from "./components/home/Header/HeaderBottom";
import SpecialCase from "./components/SpecialCase/SpecialCase";
import About from "./pages/About/About";
import SignIn from "./pages/Account/SignIn";
import SignUp from "./pages/Account/SignUp";
import Cart from "./pages/Cart/Cart";
import Contact from "./pages/Contact/Contact";
import Home from "./pages/Home/Home";
import Journal from "./pages/Journal/Journal";
import Offer from "./pages/Offer/Offer";
import Payment from "./pages/payment/Payment";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Shop from "./pages/Shop/Shop";
import Dashboard from "./pages/Dashboard/Dashboard";
import Orders from "./pages/Dashboard/Orders";
import AuthTest from "./pages/Account/AuthTest";
import Profile from "./pages/Account/Profile";
import IssuesDashboard from "./pages/Account/IssuesDashboard";
import IssueForm from "./pages/Account/IssueForm";
import IssueDetail from "./pages/Account/IssueDetail";
import AuthGuard from "./components/AuthGuard";
import RoleBasedAuthGuard from "./components/RoleBasedAuthGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./redux/authSlice";
import InventoryManagement from "./pages/Admin/InventoryManagement";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import IssueManagement from "./pages/Admin/IssueManagement";
import AdminIssueDetail from "./pages/Admin/IssueDetail";
import Checkout from "./pages/Checkout/Checkout";
import AdminPayments from "./pages/Admin/Payments";
import UserPayments from "./pages/Dashboard/Payments";
import OrderConfirmation from "./pages/OrderConfirmation/OrderConfirmation";
import OrderManagement from "./pages/Admin/OrderManagement";
import AdminOrderDetails from "./pages/Admin/AdminOrderDetails";
import ReportIssue from './pages/Account/ReportIssue';
import Redirect from './components/Redirect';
// Import Finance components
import AdminFinance from './components/Finance/AdminFinance';
import EmployeeDashboard from './components/Finance/EmployeeDashboard';
import ShopProductManagement from './pages/Admin/ShopProductManagement';

// Simple PageNotFound component
const PageNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="px-4 py-2 bg-primeColor text-white rounded hover:bg-blue-700">
        Go Home
      </Link>
    </div>
  );
};

const Layout = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  
  // Check authentication status on mount and when dependencies change
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("Checking auth status...");
        const result = await dispatch(checkAuth()).unwrap();
        console.log("Auth check result:", result);
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    // Check auth on mount and periodically if authenticated but user is null
    if (!loading) {
      if (!isAuthenticated) {
        checkAuthStatus();
      } else if (isAuthenticated && !user) {
        console.log("User is authenticated but user object is null, fetching user data...");
        checkAuthStatus();
      }
    }
    
    // Set up periodic token verification (every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        console.log("Performing periodic token verification");
        checkAuthStatus();
      }
    }, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(tokenCheckInterval);
  }, [dispatch, isAuthenticated, loading, user]);

  // Debug logging for auth state changes
  useEffect(() => {
    console.log("Auth state updated:", {
      isAuthenticated,
      loading,
      user: user ? {
        id: user._id,
        email: user.email,
        role: user.role,
        name: `${user.fName || ''} ${user.lName || ''}`
      } : null
    });
    
    // Log role-specific information if user exists
    if (user) {
      console.log(`User has role: ${user.role}. Admin access: ${user.role === 'ADMIN'}`);
    }
  }, [isAuthenticated, loading, user]);
  
  return (
    <div>
      <Header />
      <HeaderBottom />
      <SpecialCase />
      <ScrollRestoration />
      <Outlet />
      {pathname !== "/signin" && pathname !== "/signup" && <Footer />}
      <FooterBottom />
    </div>
  );
};

// Protected route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  console.log("ProtectedRoute - Auth state:", { isAuthenticated });
  
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
};

// Define user role types
const UserRoles = {
  ADMIN: 'ADMIN',
  GENERAL: 'GENERAL',
  EMPLOYEE: 'EMPLOYEE'
};

// Admin-only route wrapper component
const AdminRoute = ({ children }) => {
  return (
    <RoleBasedAuthGuard allowedRoles={[UserRoles.ADMIN]} redirectPath="/dashboard">
      {children}
    </RoleBasedAuthGuard>
  );
};

// Employee-only route wrapper component
const EmployeeRoute = ({ children }) => {
  return (
    <RoleBasedAuthGuard allowedRoles={[UserRoles.EMPLOYEE]} redirectPath="/dashboard">
      {children}
    </RoleBasedAuthGuard>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorBoundary />}>
      <Route path="/" element={<Layout />}>
        {/* ==================== Header Navlink Start here =================== */}
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/journal" element={<Journal />} />
        {/* ==================== Header Navlink End here ===================== */}
        <Route path="/offer" element={<Offer />} />
        <Route path="/product/:_id" element={<ProductDetails />} />
        
        {/* Updated Cart route - no longer needs protection since our useCartActions handles auth checks */}
        <Route 
          path="/cart" 
          element={<Cart />}
        />
        <Route 
          path="/checkout" 
          element={<ProtectedRoute><Checkout /></ProtectedRoute>}
        />
        <Route 
          path="/payment/:orderId" 
          element={<ProtectedRoute><Payment /></ProtectedRoute>}
        />
        <Route 
          path="/order-confirmation/:orderId" 
          element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>}
        />
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route 
          path="/dashboard/payments" 
          element={<ProtectedRoute><UserPayments /></ProtectedRoute>}
        />
        <Route 
          path="/dashboard/receipts/:paymentId" 
          element={<ProtectedRoute><Redirect to="/api/payments/:paymentId/receipt" /></ProtectedRoute>}
        />
        <Route 
          path="/dashboard/orders" 
          element={<ProtectedRoute><Orders /></ProtectedRoute>}
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        
        {/* Issue Dashboard Routes */}
        <Route 
          path="/account/issues" 
          element={<ProtectedRoute><IssuesDashboard /></ProtectedRoute>}
        />
        <Route 
          path="/account/issues/report" 
          element={<ProtectedRoute><ReportIssue /></ProtectedRoute>}
        />
        <Route 
          path="/account/issues/new" 
          element={<ProtectedRoute><ReportIssue /></ProtectedRoute>}
        />
        <Route 
          path="/account/issues/:id" 
          element={<ProtectedRoute><IssueDetail /></ProtectedRoute>}
        />
        
        {/* Employee Dashboard Route */}
        <Route 
          path="/employee-dashboard" 
          element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>}
        />
        
        {/* Debug route for auth testing */}
        <Route path="/auth-test" element={<AuthTest />} />
        
        {/* Admin routes with role-based protection */}
        <Route 
          path="/admin/dashboard" 
          element={<AdminRoute><AdminDashboard /></AdminRoute>}
        />
        <Route 
          path="/admin/products" 
          element={<AdminRoute><InventoryManagement /></AdminRoute>}
        />
        <Route 
          path="/admin/users" 
          element={<AdminRoute><UserManagement /></AdminRoute>}
        />
        <Route 
          path="/admin/issues" 
          element={<AdminRoute><IssueManagement /></AdminRoute>}
        />
        <Route 
          path="/admin/issues/:id" 
          element={<AdminRoute><AdminIssueDetail /></AdminRoute>}
        />
        <Route 
          path="/admin/payments" 
          element={<AdminRoute><AdminPayments /></AdminRoute>}
        />
        <Route 
          path="/admin/order-management" 
          element={<AdminRoute><OrderManagement /></AdminRoute>}
        />
        <Route 
          path="/admin/orders/:orderId" 
          element={<AdminRoute><AdminOrderDetails /></AdminRoute>}
        />
        {/* Finance Management Admin Route */}
        <Route 
          path="/admin/finance" 
          element={<AdminRoute><AdminFinance /></AdminRoute>}
        />
        <Route 
          path="/admin/shop-products" 
          element={<AdminRoute><ShopProductManagement /></AdminRoute>}
        />
      </Route>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="*" element={<PageNotFound />} />
    </Route>
  )
);

function App() {
  return (
    <div className="font-bodyFont">
      <RouterProvider router={router} />
      <ToastContainer />
    </div>
  );
}

export default App;
