import axiosClient from "../auth/axios.ts";
import auth from '@/api/auth/auth.ts'

const managerApi = {
  async getManager(){
    await auth.getCSRFToken()
    return await axiosClient.get("/api/manager");
  } ,
  //API Lấy ra các Employee dưới quyền
  async getEmployees(){
    await auth.getCSRFToken();
    return await axiosClient.get("/api/manager/employees");
  },
  // API Lấy ra các Project của Manager đang quản lý .
  async getProjects(){
    await auth.getCSRFToken();
    return await axiosClient.get("/api/manager/projects");
  }
}
export default managerApi;