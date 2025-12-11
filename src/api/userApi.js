import axiosClient from "./axiosClient";

const userApi = {
  getUser() {
    return axiosClient.get("/user");
  },

  changePassword(data) {
    return axiosClient.patch("/user/change-password", data);
  },

  updateProfile(data) {
    return axiosClient.patch("/user/profile", data);
  },

  getAllUser(params) {
    return axiosClient.get("/user/all", { params });
  },

  lockUser(data) {
    return axiosClient.patch("/user/all/lock", data);
  },

  unLockUser(data) {
    return axiosClient.patch("/user/all/un-lock", data);
  },
};

export default userApi;

