import api from "./axios";

export const arsipApi = {
  getAll: (params) => api.get("/arsip", { params }),
  getById: (id) => api.get(`/arsip/${id}`),
  getJenis: () => api.get("/arsip/jenis"),
  create: (data) =>
    api.post("/arsip", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/arsip/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/arsip/${id}`),
  download: (id) => api.get(`/arsip/${id}/download`, { responseType: "blob" }),
};
