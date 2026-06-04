import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute({ children }) {
	const { token, user, fetchMe, isLoading } = useAuthStore();

	useEffect(() => {
		if (token && !user) fetchMe();
	}, [token, user, fetchMe]);

	if (!token) return <Navigate to="/login" replace />;
	if (token && !user && isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return children;
}
