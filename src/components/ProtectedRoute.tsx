import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const verifySession = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    setIsAuthenticated(false);
                    return;
                }

                await AuthService.verifySession();
                setIsAuthenticated(true);
            } catch (error: any) {
                const status = error?.status;
                if (status === 401 || status === 403) {
                    setIsAuthenticated(false);
                    sessionStorage.clear();
                } else {
                    // Non-auth or transient error: allow access to avoid redirect flicker
                    setIsAuthenticated(true);
                }
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // Or a proper loading spinner component
    }

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
