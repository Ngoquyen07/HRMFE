import axiosClient from "../auth/axios.ts";
import auth from '@/api/auth/auth.ts'
const projectApi = {
  async getProjectById(id : Number): Promise<any> {
    await auth.getCSRFToken();
    return await axiosClient.get(`/api/manager/projects/${id}`)
  },
  async updateProject(data: any): Promise<any> {
    await auth.getCSRFToken();
    return await axiosClient.put(`/api/manager/projects/${data.id}`, data)
  }
}
export default projectApi ;