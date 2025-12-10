import axiosClient from "../auth/axios.ts";
import auth from '@/api/auth/auth.ts'
const taskApi = {
  async creatTask(data: any){
    await auth.getCSRFToken();
    return await axiosClient.post(`/api/manager/tasks`, data);
  },
  async updateTask(id:Number , data: any){
    await auth.getCSRFToken();
    return await axiosClient.put(`/api/manager/tasks/${id}`, data);
  },
  async deleteTask(id:Number){
    await auth.getCSRFToken();
    return await axiosClient.delete(`/api/manager/tasks/${id}`);
  }
}
export default taskApi;