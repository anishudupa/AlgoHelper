import { create } from "zustand";
import { authApi } from "@/api/auth";

export const useAuthStore = create((set) => ({
	user: null,
	token: localStorage.getItem("token") || null,
	isLoading: false,
	error: null,

	login: async (credentials) => {
		set({ isLoading: true, error: null });
		try {
			const { data } = await authApi.login(credentials);
			localStorage.setItem("token", data.token);
			set({ user: data.user, token: data.token, isLoading: false });
			return { success: true };
		} catch (err) {
			const message = err.response?.data?.message || "Login failed";
			set({ error: message, isLoading: false });
			return { success: false, message };
		}
	},

	register: async (credentials) => {
		set({ isLoading: true, error: null });
		try {
			const { data } = await authApi.register(credentials);
			localStorage.setItem("token", data.token);
			set({ user: data.user, token: data.token, isLoading: false });
			return { success: true };
		} catch (err) {
			const message = err.response?.data?.message || "Registration failed";
			set({ error: message, isLoading: false });
			return { success: false, message };
		}
	},

	logout: () => {
		localStorage.removeItem("token");
		set({ user: null, token: null });
	},

	fetchMe: async () => {
		set({ isLoading: true });
		try {
			const { data } = await authApi.getMe();
			set({ user: data.user, isLoading: false });
		} catch {
			localStorage.removeItem("token");
			set({ user: null, token: null, isLoading: false });
		}
	},

	clearError: () => set({ error: null }),
}));
