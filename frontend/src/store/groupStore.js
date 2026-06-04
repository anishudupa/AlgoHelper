import { create } from "zustand";
import { groupsApi } from "@/api/groups";

export const useGroupStore = create((set, get) => ({
	groups: [], // nested tree
	isLoading: false,
	error: null,

	fetchGroups: async () => {
		set({ isLoading: true });
		try {
			const { data } = await groupsApi.getAll();
			set({ groups: data.data, isLoading: false });
		} catch (err) {
			set({ error: err.response?.data?.message, isLoading: false });
		}
	},

	createGroup: async (payload) => {
		try {
			const { data } = await groupsApi.create(payload);
			await get().fetchGroups(); // re-fetch to get updated tree
			return { success: true, data: data.data };
		} catch (err) {
			return { success: false, message: err.response?.data?.message };
		}
	},

	updateGroup: async (id, payload) => {
		try {
			await groupsApi.update(id, payload);
			await get().fetchGroups();
			return { success: true };
		} catch (err) {
			return { success: false, message: err.response?.data?.message };
		}
	},

	deleteGroup: async (id) => {
		try {
			await groupsApi.remove(id);
			await get().fetchGroups();
			return { success: true };
		} catch (err) {
			return { success: false, message: err.response?.data?.message };
		}
	},
}));
