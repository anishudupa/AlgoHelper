import { create } from "zustand";
import { questionsApi } from "@/api/questions";

export const useQuestionStore = create((set) => ({
	questions: [],
	currentQuestion: null,
	isLoading: false,
	error: null,

	fetchQuestions: async (params) => {
		set({ isLoading: true });
		try {
			const { data } = await questionsApi.getAll(params);
			set({ questions: data.data, isLoading: false });
		} catch (err) {
			set({ error: err.response?.data?.message, isLoading: false });
		}
	},

	fetchQuestion: async (id) => {
		set({ isLoading: true, currentQuestion: null });
		try {
			const { data } = await questionsApi.getOne(id);
			set({ currentQuestion: data.data, isLoading: false });
		} catch (err) {
			set({ error: err.response?.data?.message, isLoading: false });
		}
	},

	createQuestion: async (payload) => {
		try {
			const { data } = await questionsApi.create(payload);
			return { success: true, data: data.data };
		} catch (err) {
			return { success: false, message: err.response?.data?.message };
		}
	},

	updateQuestion: async (id, payload) => {
		try {
			const { data } = await questionsApi.update(id, payload);
			set((state) => ({
				currentQuestion: data.data,
				questions: state.questions.map((q) => (q._id === id ? data.data : q)),
			}));
			return { success: true };
		} catch (err) {
			return { success: false, message: err.response?.data?.message };
		}
	},

	deleteQuestion: async (id) => {
		try {
			await questionsApi.remove(id);
			set((state) => ({
				questions: state.questions.filter((q) => q._id !== id),
			}));
			return { success: true };
		} catch (err) {
			return { success: false, message: err.response?.data?.message };
		}
	},

	clearCurrent: () => set({ currentQuestion: null }),
}));
