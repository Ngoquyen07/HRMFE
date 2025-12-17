<script setup lang="ts">
import managerApi from '@/api/manager/managerApi'
import { onMounted, ref, computed, provide, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import SideBar from '@/components/asset/SideBar.vue'
import HomeHeader from '@/components/manager/home/HomeHeader.vue'
import DashBoardCard from '@/components/manager/home/DashBoardCard.vue'
import ProjectsList from '@/components/manager/home/ProjectsList.vue'
import MemberList from '@/components/manager/home/MemberList.vue'
import CreateModal from '@/components/manager/home/CreateModal.vue'
import projectApi from '@/api/manager/projectApi.ts'
import SuccessToast from '@/components/asset/SuccessToast.vue'

// --- Dữ liệu trang ---
const manager = ref<any>(null)
const employees = ref<any[]>([])
const projects = ref<any[]>([])
const loading = ref(false)

const error = ref('')

// --- Dữ liệu Modal & Form ---
const showModal = ref(false)
const isSubmitting = ref(false)

// Khởi tạo form data
const form = reactive({
  name: '',
  description: '',
  manager_id: '', // Sẽ set khi mở modal
  start_date: '',
  end_date: ''
})

// Quản lý trạng thái của Toast
const toastRef = ref<{
  show: (message: string, type?: "success" | "danger", duration?: number) => void
  hide: () => void
} | null>(null)

// --- Logic Tính Toán Chỉ Số ---
const stats = computed(() => {
  const total = projects.value.length
  const done = projects.value.filter((p) => p.status === 'done').length
  const active = projects.value.filter((p) => ['active', 'processing'].includes(p.status)).length
  const pending = projects.value.filter((p) => ['new', 'pending'].includes(p.status)).length
  const percentDone = total > 0 ? Math.round((done / total) * 100) : 0
  return { total, done, active, pending, percentDone }
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done': return 'success'
    case 'active': return 'primary'
    case 'pending': return 'warning'
    case 'cancelled': return 'danger'
    default: return 'secondary'
  }
}

const router = useRouter()
function goToProject(id: number) {
  router.push(`/manager/projects/${id}`)
}

// --- Logic Modal ---
function openCreateModal() {
  // Reset form
  form.name = ''
  form.description = ''
  form.start_date = ''
  form.end_date = ''
  if (manager.value) {
    form.manager_id = manager.value.id.toString()
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}


watch(() => form.start_date, (newStart) => {
  if (newStart && form.end_date && form.end_date < newStart) {
    form.end_date = ''
  }
})

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [managerRes, employeesRes, projectsRes] = await Promise.all([
      managerApi.getManager(),
      managerApi.getEmployees(),
      managerApi.getProjects(),
    ])
    manager.value = managerRes.data.data
    employees.value = employeesRes.data.data
    projects.value = projectsRes.data.data
  } catch (err: any) {
    error.value = 'Failed to load data.'
  } finally {
    loading.value = false
  }
}

const errors = ref({});
provide('errors', errors);
async function submitProject() {
  isSubmitting.value = true
  errors.value = {};
  try {
    const res = await projectApi.createProject(form);
    console.log(res)
    closeModal()
    toastRef.value?.show("Created project successfully.", "success")
    await loadAll()
  } catch (err : any) {
    errors.value = err.response.data.errors
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() =>{
  loadAll()
})
provide('employees', employees);
provide('form', form);
</script>
<template>
  <div class="container py-4">
    <SideBar/>
    <HomeHeader :manager="manager" :openCreateModal="openCreateModal" />
    <SuccessToast ref="toastRef" />
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else>
      <div class="row g-3 mb-4">
        <DashBoardCard title="Total Projects" color="bg-primary" :count="stats.total"/>
        <DashBoardCard title="In Progress" color="bg-info" :count="stats.active"/>
        <DashBoardCard title="Completed" color="bg-success" :count="stats.done"/>
        <DashBoardCard title="Total Employees" color="bg-danger" :count="employees.length"/>
      </div>
      <div class="row g-4">
        <ProjectsList :projects="projects" :go-to-project="goToProject" :get-status-color="getStatusColor"/>
        <MemberList :employees="employees"/>
      </div>
    </div>
    <CreateModal :show-modal="showModal" :close-modal="closeModal" :submit-project="submitProject" :is-submitting="isSubmitting"/>
  </div>
</template>
<style scoped>
</style>