import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import SearchResults from './pages/SearchResults';
import BookDetails from './pages/BookDetails';
import AuthorDetails from './pages/AuthorDetails';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AuthCallback from './pages/auth/callback';
import Reviews from './pages/reviews';
import Library from './pages/Library';
import { useUser } from './contexts/UserContext';
import Spinner from './components/ui/spinner';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { session, isLoading } = useUser();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/book/:id" element={<BookDetails />} />
      <Route path="/author/:id" element={<AuthorDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route 
        path="/library" 
        element={<ProtectedRoute element={<Library />} />} 
      />
      <Route 
        path="/reviews" 
        element={<ProtectedRoute element={<Reviews />} />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
