/**
 * Protected Route Component
 * Protects recruiter/company dashboard routes
 * Redirects to home page if company is not authenticated
 * Shows nothing while checking for stored token
 */
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { companyToken, isLoadingToken } = useContext(AppContext);

  // Show nothing while checking for stored token
  if (isLoadingToken) return null; 
  
  // Redirect to home if not authenticated
  if (!companyToken) return <Navigate to="/" />;

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;
