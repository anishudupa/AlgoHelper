import api from "@/lib/axios";

export const groupsApi = {
	getAll: () => api.get("/groups"),
	create: (data) => api.post("/groups", data),
	update: (id, data) => api.put(`/groups/${id}`, data),
	remove: (id) => api.delete(`/groups/${id}`),
};
