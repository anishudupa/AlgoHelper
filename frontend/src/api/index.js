import api from "@/lib/axios";

export const revisionApi = {
	getNext: (params) => api.get("/revision/next", { params }),
	reveal: (questionId) => api.get(`/revision/${questionId}/reveal`),
	mark: (questionId, data) => api.post(`/revision/${questionId}/mark`, data),
};

export const bookmarksApi = {
	getAll: () => api.get("/bookmarks"),
	add: (questionId) => api.post(`/bookmarks/${questionId}`),
	remove: (questionId) => api.delete(`/bookmarks/${questionId}`),
};

export const progressApi = {
	getStats: () => api.get("/progress"),
};

export const exploreApi = {
	getGroups: (params) => api.get("/explore/groups", { params }),
	getQuestions: (params) => api.get("/explore/questions", { params }),
	getQuestion: (id) => api.get(`/explore/questions/${id}`),
};
