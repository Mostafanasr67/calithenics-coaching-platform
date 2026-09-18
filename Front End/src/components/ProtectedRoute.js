import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ element, requiredRole }) {
	const role = localStorage.getItem('role');
	const token = localStorage.getItem('token');

	// If no token, redirect to login
	if (!token) {
		return <Navigate to="/?mode=login" replace />;
	}

	// If role doesn't match required role, redirect to appropriate dashboard
	if (requiredRole && role !== requiredRole) {
		if (role === 'coach') {
			return <Navigate to="/coachDashboard" replace />;
		} else if (role === 'client') {
			const userId = localStorage.getItem('userId');
			return <Navigate to={`/clientDetails/${userId}`} replace />;
		}
		return <Navigate to="/?mode=login" replace />;
	}

	return element;
}
