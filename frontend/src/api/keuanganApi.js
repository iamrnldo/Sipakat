import api from "./axios";

export const keuanganApi = {
  getAll: (params) => api.get("/keuangan", { params }),
  getById: (id) => api.get(`/keuangan/${id}`),
  create: (data) =>
    api.post("/keuangan", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/keuangan/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/keuangan/${id}`),
  download: (id) =>
    api.get(`/keuangan/${id}/download`, { responseType: "blob" }),
  share: (id) => api.get(`/keuangan/${id}/share`),
};
