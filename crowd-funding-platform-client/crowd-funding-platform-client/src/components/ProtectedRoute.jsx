import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();

  // Debug user object
  console.log("Protected Route - User:", user);

  if (!user) return <Navigate to="/login" replace />;

  // Convert role to string for comparison if it's a number
  const userRole = typeof user.role === 'number' ? user.role : 
                  (user.role === 'ADMIN' ? 1 : 
                   user.role === 'NGO' ? 2 : 3);

  // Check role-based access
  if (roles && roles.length > 0 && !roles.includes(userRole)) {
    // Redirect user to their dashboard if they try to access another role's route
    switch (userRole) {
      case 1:
        return <Navigate to="/admin" replace />;
      case 2:
        return <Navigate to="/ngo" replace />;
      case 3:
        return <Navigate to="/donor" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
