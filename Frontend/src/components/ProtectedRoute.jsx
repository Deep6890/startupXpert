import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';

const ProtectedRoute = ({ children, requireAnalysis = false }) => {
  const { isLoggedIn, startupDetails, analysisScores, onboardingRole } = useStartup();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const isStep1Done = !!onboardingRole?.fullName && !!onboardingRole?.profession;
  const isStep2Done = !!startupDetails?.startupName && !!startupDetails?.startupDescription;
  const hasValidatedStartup = !!startupDetails?.startupName && !!analysisScores;

  // Enforce sequential onboarding flow for unvalidated users
  if (!hasValidatedStartup) {
    if (location.pathname === '/onboarding/details' && !isStep1Done) {
      return <Navigate to="/onboarding/role" replace />;
    }
    if ((location.pathname === '/startup/validate' || location.pathname === '/analysis/loader') && (!isStep1Done || !isStep2Done)) {
      return <Navigate to="/onboarding/role" replace />;
    }
  }

  if (requireAnalysis) {
    if (!hasValidatedStartup) {
      return <Navigate to="/onboarding/role" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
