import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toast";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

// Auth
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// App pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import QuestionPage from "@/pages/question/QuestionPage";
import RevisionPage from "@/pages/revision/RevisionPage";
import ExplorePage from "@/pages/explore/ExplorePage";
import BookmarksPage from "@/pages/bookmarks/BookmarksPage";
import ProgressPage from "@/pages/progress/ProgressPage";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Public routes */}
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				{/* Protected routes — all wrapped in sidebar layout */}
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<AppLayout />
						</ProtectedRoute>
					}>
					<Route index element={<Navigate to="/dashboard" replace />} />
					<Route path="dashboard" element={<DashboardPage />} />
					<Route path="questions/:id" element={<QuestionPage />} />
					<Route path="revision" element={<RevisionPage />} />
					<Route path="explore" element={<ExplorePage />} />
					<Route
						path="explore/questions/:id"
						element={<QuestionPage readOnly />}
					/>
					<Route path="bookmarks" element={<BookmarksPage />} />
					<Route path="progress" element={<ProgressPage />} />
				</Route>

				{/* Catch-all */}
				<Route path="*" element={<Navigate to="/dashboard" replace />} />
			</Routes>

			<Toaster />
		</BrowserRouter>
	);
}
