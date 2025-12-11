<script setup lang="ts">
import { onMounted, ref, computed, reactive } from "vue"
import { useRoute } from "vue-router"
// Import APIs (Đảm bảo đường dẫn đúng với project của bạn)
import projectApi from "@/api/manager/projectApi.ts"
import managerApi from "@/api/manager/managerApi.ts"
import taskApi from "@/api/manager/taskApi.ts"

// ====================== 1. INTERFACES ======================
interface Employee {
  id: number
  name: string
}

interface Task {
  id?: number
  name: string
  description: string
  status: string
  start_date: string | null
  end_date: string | null
  progress: number
  employee_id: number | null
  employee?: Employee
}

interface Project {
  id: number
  name: string
  description: string
  status: string
  progress: number
  start_date: string
  end_date: string
  manager: { name: string }
  tasks: Task[]
  created_at: string
}

// ====================== 2. STATE MANAGEMENT ======================
const route = useRoute()
const id = Number(route.params.id)

// Data
const employees = ref<Employee[]>([])
const projectInfo = ref<Project | null>(null)
const originalProjectState = ref<{ status: string; progress: number } | null>(null)

// Modal State
const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentTaskId = ref<number | null>(null)

// Validation & Toast State
const errors = ref<Record<string, string[]>>({})
const projectErrors = ref<Record<string, string[]>>({})

const toastState = reactive({
  show: false,
  message: "",
  type: "success" as "success" | "error"
})

// Form Data (Dùng chung cho Create và Edit)
const defaultTaskState: Task = {
  name: "",
  description: "",
  status: "todo",
  start_date: "",
  end_date: "",
  progress: 0,
  employee_id: null,
}
const currentTaskForm = reactive<Task>({ ...defaultTaskState })

// ====================== 3. HELPER FUNCTIONS ======================

// Format Date hiển thị (VD: 25/12/2025)
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A"
  return new Intl.DateTimeFormat("en-GB").format(new Date(dateString))
}

// Format Date cho Input (VD: 2025-12-25) - Cắt chuỗi ISO
const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return ""
  return dateString.split('T')[0]
}

// Hiển thị Toast
const showToast = (message: string, type: "success" | "error" = "success") => {
  toastState.message = message
  toastState.type = type
  toastState.show = true
  setTimeout(() => (toastState.show = false), 3000)
}

// Badge màu sắc cho Status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'todo': return 'bg-secondary';
    case 'doing': return 'bg-primary';
    case 'review': return 'bg-info text-dark';
    case 'done': return 'bg-success';
    case 'cancelled': return 'bg-danger';
    default: return 'bg-light text-dark';
  }
}

// Màu sắc cho Progress Bar
const getProgressColor = (progress: number) => {
  if (progress === 100) return 'bg-success'
  if (progress >= 50) return 'bg-primary'
  return 'bg-warning'
}

// ====================== 4. API ACTIONS ======================

// Load Project Info
async function loadInfo() {
  try {
    const res = await projectApi.getProjectById(id)
    projectInfo.value = res.data.data

    // Lưu trạng thái gốc để so sánh thay đổi
    if (projectInfo.value) {
      originalProjectState.value = {
        status: projectInfo.value.status,
        progress: projectInfo.value.progress,
      }
    }
  } catch (err) {
    console.error("Failed to load project", err)
    showToast("Failed to load project data", "error")
  }
}

// Load Employees List
async function loadEmployees() {
  try {
    const res = await managerApi.getEmployees()
    employees.value = res.data.data
  } catch (err) {
    console.error("Failed to load employees", err)
  }
}

// --- PROJECT UPDATE LOGIC ---
const hasProjectChanged = computed(() => {
  if (!projectInfo.value || !originalProjectState.value) return false
  return (
    projectInfo.value.status !== originalProjectState.value.status ||
    projectInfo.value.progress !== originalProjectState.value.progress
  )
})

async function handleUpdateProject() {
  if (!projectInfo.value) return
  projectErrors.value = {} // reset lỗi cũ
  try {
    // Gọi API update project (Giả định api updateProject tồn tại)
    // await projectApi.updateProject(id, { status: ..., progress: ... })
    const res = await projectApi.updateProject(projectInfo.value) ;
    console.log(res)
    originalProjectState.value = {
      status: projectInfo.value.status,
      progress: projectInfo.value.progress,
    }
    showToast("Project information updated successfully", "success")
  } catch (err : any) {
    if (err.response?.status === 422) {
      projectErrors.value = err.response.data.errors
      showToast("Validation error. Please check your input.", "error")
    }

    else {
      showToast(err.response?.data?.message || "Failed to update project", "error")
    }
  }
}

// --- MODAL & TASK LOGIC ---

function openCreateModal() {
  isEditMode.value = false
  currentTaskId.value = null
  Object.assign(currentTaskForm, defaultTaskState) // Reset form
  errors.value = {}
  isModalOpen.value = true
}

function openEditModal(task: Task) {
  isEditMode.value = true
  currentTaskId.value = task.id!
  errors.value = {}

  // Fill dữ liệu vào form
  Object.assign(currentTaskForm, {
    name: task.name,
    description: task.description,
    status: task.status,
    progress: task.progress,
    employee_id: task.employee_id,
    start_date: formatDateForInput(task.start_date), // Xử lý ngày tháng cho input
    end_date: formatDateForInput(task.end_date)
  })

  isModalOpen.value = true
}

function closeTaskModal() {
  isModalOpen.value = false
}

// --- TASK CRUD OPERATIONS ---

// 1. Create Task
async function handleCreateTask() {
  errors.value = {}
  try {
    const payload = { project_id: id, ...currentTaskForm }
    const res = await taskApi.creatTask(payload) // Lưu ý: Method tên 'creatTask' theo api cũ của bạn

    showToast(res.data.message || "Task created successfully", "success")
    closeTaskModal()
    await loadInfo()
  } catch (err: any) {
    handleApiErrors(err)
  }
}

// 2. Update Task
async function handleUpdateTask() {
  if (!currentTaskId.value) return
  errors.value = {} // reset lỗi cũ

  try {
    const payload = {
      project_id: id,
      start_date : currentTaskForm.start_date,
      end_date:currentTaskForm.end_date,
      status: currentTaskForm.status,
      description: currentTaskForm.description,
    }

    await taskApi.updateTask(currentTaskId.value, payload)

    showToast("Task updated successfully", "success")
    closeTaskModal()
    await loadInfo()

  } catch (err: any) {
    // ✅ BẮT LỖI VALIDATE 422
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
      showToast("Update failed: Validation error!", "error")
    }
    // ✅ LỖI SERVER KHÁC
    else {
      showToast(err.response?.data?.message || "Failed to update task", "error")
    }
  }
}


// 3. Delete Task
async function handleDeleteTask() {
  if (!currentTaskId.value) return
  if (!confirm("Are you sure you want to delete this task?")) return

  try {
    await taskApi.deleteTask(currentTaskId.value)

    showToast("Task deleted successfully", "success")
    closeTaskModal()
    await loadInfo()

  } catch (err: any) {
    showToast(err.response?.data?.message || "Delete failed", "error")
  }
}

// Error Handler helper
function handleApiErrors(err: any) {
  if (err.response?.status === 422) {
    errors.value = err.response.data.errors
    showToast("Validation Error. Please check inputs.", "error")
  } else {
    showToast(err.response?.data?.message || "Server Error", "error")
  }
}

// Lifecycle Hook
onMounted(() => {
  loadInfo()
  loadEmployees()
})
</script>

<template>
  <div class="container mt-4 position-relative" v-if="projectInfo">

    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1060">
      <div
        class="toast align-items-center text-white border-0 show"
        :class="toastState.type === 'success' ? 'bg-success' : 'bg-danger'"
        v-if="toastState.show"
      >
        <div class="d-flex">
          <div class="toast-body">{{ toastState.message }}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toastState.show = false"></button>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Project Details: {{ projectInfo.name }}</h2>
      <button class="btn btn-secondary" @click="$router.back()">Back</button>
    </div>

    <div class="card mb-4 shadow-sm">
      <div class="card-header bg-primary text-white">General Information</div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <p><strong>Manager:</strong> {{ projectInfo.manager.name }}</p>
            <p><strong>Start Date:</strong> {{ formatDate(projectInfo.start_date) }}</p>
            <p><strong>End Date:</strong> {{ formatDate(projectInfo.end_date) }}</p>
            <p><strong>Created At:</strong> {{ formatDate(projectInfo.created_at) }}</p>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label fw-bold">Status</label>
              <select class="form-select"
                      v-model="projectInfo.status"
                      :class="{'is-invalid': projectErrors.status}">
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div class="invalid-feedback" v-if="projectErrors.status">
                {{ projectErrors.status[0] }}
              </div>

            </div>

            <div class="mb-3">
              <label class="form-label fw-bold d-flex justify-content-between">
                <span>Progress</span>
                <span class="badge" :class="getProgressColor(projectInfo.progress)">
                  {{ projectInfo.progress }}%
                </span>
              </label>

              <div class="d-flex align-items-center">
                <input
                  type="range"
                  class="form-range"
                  v-model.number="projectInfo.progress"
                  min="0"
                  max="100"
                  step="1"
                  :class="{'is-invalid': projectErrors.progress}"
                />
              </div>

              <div class="invalid-feedback d-block" v-if="projectErrors.progress">
                {{ projectErrors.progress[0] }}
              </div>
            </div>

            <div class="d-flex justify-content-end">
              <button class="btn btn-success" :disabled="!hasProjectChanged" @click="handleUpdateProject">
                <i class="bi bi-save me-1"></i> Update Project Info
              </button>
            </div>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col-12">
            <label class="fw-bold">Description:</label>
            <p class="text-muted border p-2 rounded bg-light">{{ projectInfo.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Task List</h5>
        <button class="btn btn-primary btn-sm" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i> Add New Task
        </button>
      </div>

      <div class="card-body p-0">
        <div v-if="projectInfo.tasks.length" class="table-responsive">
          <table class="table table-hover table-nowrap align-middle mb-0">
            <thead class="table-light">
            <tr class="text-uppercase text-secondary small fw-bold">
              <th style="width: 50px;">ID</th>
              <th>Task Name</th>
              <th style="width: 150px;">Assigned To</th>
              <th style="width: 100px;">Status</th>
              <th style="width: 150px;">Progress</th>
              <th style="width: 120px;">Deadline</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="task in projectInfo.tasks"
              :key="task.id"
              @click="openEditModal(task)"
              style="cursor: pointer;"
              title="Click to edit"
            >
              <td class="text-muted fw-bold">#{{ task.id }}</td>

              <td><span class="fw-medium text-dark">{{ task.name }}</span></td>

              <td>
                <div v-if="task.employee" class="d-flex align-items-center">
                  <span>{{ task.employee.name }}</span>
                </div>
                <span v-else class="badge bg-light text-muted border">Unassigned</span>
              </td>

              <td>
                <span class="badge rounded-pill" :class="getStatusBadge(task.status)">{{ task.status }}</span>
              </td>

              <td>
                <div class="d-flex align-items-center">
                  <span class="me-2 small fw-bold text-muted" style="width: 35px">{{ task.progress }}%</span>
                  <div class="progress flex-grow-1" style="height: 6px; width: 100px;">
                    <div class="progress-bar rounded" role="progressbar" :style="{ width: task.progress + '%' }" :class="getProgressColor(task.progress)"></div>
                  </div>
                </div>
              </td>

              <td class="text-muted">
                <i class="bi bi-calendar-event me-1"></i> {{ formatDate(task.end_date) }}
              </td>

              <td class="text-end">
                <button class="btn btn-sm btn-link text-primary">
                  <i class="bi bi-pencil-square"></i>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-5">
          <i class="bi bi-clipboard-x text-muted" style="font-size: 2rem;"></i>
          <p class="text-muted mt-2">No tasks found for this project.</p>
          <button class="btn btn-outline-primary btn-sm" @click="openCreateModal">Create First Task</button>
        </div>
      </div>
    </div>

    <div class="modal fade show" v-if="isModalOpen" style="display: block; background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? 'Edit Task' : 'Create New Task' }}</h5>
            <button type="button" class="btn-close" @click="closeTaskModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Task Name </label>
                  <input type="text" class="form-control" :class="{'is-invalid': errors.name}" v-model="currentTaskForm.name" :readonly="isEditMode"/>
                  <div class="invalid-feedback" v-if="errors.name">{{ errors.name[0] }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Assign Employee</label>
                  <select class="form-select" :class="{'is-invalid': errors.employee_id}" v-model="currentTaskForm.employee_id" :disabled="isEditMode" >
                    <option :value="null">Select an employee...</option>
                    <option v-for="emp in employees" :value="emp.id" :key="emp.id">
                      {{ emp.name }}
                    </option>
                  </select>
                  <div class="invalid-feedback" v-if="errors.employee_id">{{ errors.employee_id[0] }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Start Date</label>
                  <input type="date" class="form-control" :class="{'is-invalid': errors.start_date}" v-model="currentTaskForm.start_date"  />
                  <div class="invalid-feedback" v-if="errors.start_date">{{ errors.start_date[0] }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">End Date</label>
                  <input type="date" class="form-control" :class="{'is-invalid': errors.end_date}" v-model="currentTaskForm.end_date" />
                  <div class="invalid-feedback" v-if="errors.end_date">{{ errors.end_date[0] }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="currentTaskForm.status">
                    <option value="todo">To Do</option>
                    <option value="doing">Doing</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Progress (%)</label>

                  <input
                    type="number"
                    class="form-control"
                    :class="{'is-invalid': errors.progress}"
                    v-model="currentTaskForm.progress"
                    min="0"
                    max="100"
                    :readonly="isEditMode"
                  />
                  <div class="invalid-feedback" v-if="errors.progress">
                    {{ errors.progress[0] }}
                  </div>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" rows="3" v-model="currentTaskForm.description"></textarea>
                  <div class="invalid-feedback d-block" v-if="errors.description">{{ errors.description[0] }}</div>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer justify-content-between">
            <div>
              <button v-if="isEditMode" class="btn btn-outline-danger" @click="handleDeleteTask">
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>

            <div>
              <button type="button" class="btn btn-secondary me-2" @click="closeTaskModal">Cancel</button>

              <button v-if="!isEditMode" type="button" class="btn btn-primary" @click="handleCreateTask">
                Create Task
              </button>

              <button v-else type="button" class="btn btn-success" @click="handleUpdateTask">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div v-else class="d-flex justify-content-center align-items-center" style="height: 50vh;">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<style scoped>
.modal.show {
  display: block;
}
/* Hiệu ứng hover cho bảng */
tbody tr:hover {
  background-color: #f8f9fa;
}
/* Style cho Toast */
.toast {
  transition: opacity 0.3s ease-in-out;
}
</style>