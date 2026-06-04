import api from "@/lib/axios";

export const questionsApi = {
	getAll: (params) => api.get("/questions", { params }),
	getOne: (id) => api.get(`/questions/${id}`),
	create: (data) => api.post("/questions", data),
	update: (id, data) => api.put(`/questions/${id}`, data),
	remove: (id) => api.delete(`/questions/${id}`),
};
