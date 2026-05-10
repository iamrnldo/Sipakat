import api from "./axios";

export const kepegawaianApi = {
  getAll: (params) => api.get("/kepegawaian", { params }),
  getById: (id) => api.get(`/kepegawaian/${id}`),
  create: (data) =>
    api.post("/kepegawaian", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/kepegawaian/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/kepegawaian/${id}`),
};
