import axiosClient from "../auth/axios.ts";
import auth from '@/api/auth/auth.ts'
const employeeApi = {
  async getEmployee(){
    await auth.getCSRFToken() ;
    return await axiosClient.get("/api/employee");
  }
}
export default employeeApi;