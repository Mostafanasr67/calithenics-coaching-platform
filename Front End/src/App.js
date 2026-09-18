import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login";
import CoachDashboard from "./pages/coachDashboard";
import ClientDetails from "./pages/clientDetails";
import PlanDetails from "./pages/planDetails";
import CoachAbout from "./pages/coachAbout";
import NewClientForm from "./pages/newClientForm";
import NewPlanForm from "./pages/newPlanForm";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
	const router = createBrowserRouter([
		{
			path: "/",
			element: <Login />
		},
		{
			path: "/coachDashboard",
			element: <ProtectedRoute element={<CoachDashboard />} requiredRole="coach" />
		},
		{
			path: "/clientDashboard/:id",
			element: <ProtectedRoute element={<ClientDetails />} requiredRole="client" />
		},
		{
			path: "/clientDetails/:id",
			element: <ClientDetails />
		},
		{
			path: "clients/:id/planDetails/:planId",
			element: <PlanDetails />,
		},
		{
			path: "/about",
			element: <CoachAbout />,
		},
		{
			path: '/newClient',
			element: <ProtectedRoute element={<NewClientForm />} requiredRole="coach" />
		},
		{
			path: '/newClient/:id',
			element: <ProtectedRoute element={<NewClientForm />} requiredRole="coach" />
		},
		{
			path: '/newPlan/:clientId/:planId',
			element: <ProtectedRoute element={<NewPlanForm />} requiredRole="coach" />
		},
		{
			path: '/newPlan/:clientId',
			element: <ProtectedRoute element={<NewPlanForm />} requiredRole="coach" />
		},
		{
			path: '/clients/:id/planDetails/:planId',
			element: <ProtectedRoute element={<PlanDetails />} requiredRole="coach" />
		}
	]);

	return (
		<RouterProvider router={router} />
	);
}

export default App;
