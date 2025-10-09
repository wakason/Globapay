import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleRouteProps {
    required: 'customer' | 'employee';
    children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ required, children }) => {
    const location = useLocation();
    const role = (sessionStorage.getItem('role') || '').toLowerCase();
    const token = sessionStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role !== required) {
        // Redirect to the default landing page for the current role if mismatched
        const target = role === 'employee' ? '/pending' : '/payment';
        return <Navigate to={target} replace />;
    }

    return <>{children}</>;
};

export default RoleRoute;


