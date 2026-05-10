import api from "./axios";

export const profilApi = {
  getProfil: () => api.get("/profil"),
  updateProfil: (data) =>
    api.put("/profil", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAktivitas: (params) => api.get("/profil/aktivitas", { params }),
  getPerangkat: () => api.get("/profil/perangkat"),
  // Admin
  getAllUsers: (params) => api.get("/profil/users", { params }),
  createUser: (data) => api.post("/profil/users", data),
  updateUser: (id, data) => api.patch(`/profil/users/${id}`, data),
};
