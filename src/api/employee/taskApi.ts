import axiosClient from "../auth/axios.ts";
import auth from '@/api/auth/auth.ts'

const taskApi = {
  async updateTask(id:Number , data: any){
    await auth.getCSRFToken();
    return await axiosClient.put(`/api/employee/tasks/${id}`, data);
  },
}
export default taskApi;