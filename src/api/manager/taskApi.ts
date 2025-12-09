import axiosClient from "../auth/axios.ts";
import auth from '@/api/auth/auth.ts'
import managerApi from '@/api/manager/managerApi.ts'
const taskApi = {
  async creatTask(data: any): Promise<void> {
    await auth.getCSRFToken();
    return await axiosClient.post(`/api/manager/tasks`, data);
  }
}
export default taskApi;