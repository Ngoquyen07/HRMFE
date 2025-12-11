<script setup lang="ts">
import LogoutBtn from '@/components/buttons/LogoutBtn.vue'
import employeeApi from '@/api/employee/employeeApi.ts'
import { onMounted, ref, computed, reactive } from 'vue'
import taskApi from '@/api/employee/taskApi.ts'

// --- 1. DATA & STATE ---
const employee = ref<any>(null)
const manager = ref<string>('')
const tasks = ref<any[]>([])
const loading = ref(false)

// Modal State
const isModalOpen = ref(false)
const updateLoading = ref(false)

// Toast State
const toastState = reactive({
  show: false,
  message: '',
  type: 'success' // success | danger
})

// Form Data (Dùng reactive để binding form trong modal)
const currentTaskForm = reactive({
  id: 0,
  name: '',
  description: '',
  project_name: '',
  start_date: '',
  end_date: '',
  status: 'todo',
  progress: 0
})

// --- 2. COMPUTED: Thống kê ---
const stats = computed(() => {
  if (!tasks.value) return { total: 0, todo: 0, doing: 0, done: 0 }
  return {
    total: tasks.value.length,
    todo: tasks.value.filter(t => t.status === 'todo').length,
    doing: tasks.value.filter(t => t.status === 'doing').length,
    done: tasks.value.filter(t => t.status === 'done').length
  }
})

// --- 3. HELPER: Màu sắc ---
const getStatusColor = (status: string) => {
  switch (status) {
    case 'done': return 'success'
    case 'doing': return 'primary'
    case 'todo': return 'warning'
    default: return 'secondary'
  }
}
// Hàm hiển thị Toast
const showToast = (message: string, type = 'success') => {
  toastState.message = message
  toastState.type = type
  toastState.show = true
  // Tự động tắt sau 3 giây
  setTimeout(() => {
    toastState.show = false
  }, 3000)
}
// --- 4. DATA LOADING ---
async function loadAllData() {
  loading.value = true
  try {
    const [empRes, manRes, taskRes] = await Promise.all([
      employeeApi.getEmployee(),
      employeeApi.getManager(),
      employeeApi.getTasks()
    ])
    employee.value = empRes.data.data
    manager.value = manRes.data.data
    tasks.value = taskRes.data.data
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error)
  } finally {
    loading.value = false
  }
}

// --- 5. MODAL & UPDATE LOGIC ---

// Mở modal và fill dữ liệu
function openUpdateModal(task: any) {
  // Copy dữ liệu vào form (Tránh sửa trực tiếp vào mảng tasks khi chưa lưu)
  currentTaskForm.id = task.id
  currentTaskForm.name = task.name
  currentTaskForm.description = task.description
  currentTaskForm.project_name = task.project?.name || 'Unknown'
  currentTaskForm.start_date = task.start_date
  currentTaskForm.end_date = task.end_date
  currentTaskForm.status = task.status
  currentTaskForm.progress = task.progress

  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

// Xử lý lưu cập nhật
async function handleUpdateTask() {
  updateLoading.value = true
  try {
    // Chỉ gửi những trường Employee được phép sửa (Status, Progress)
    const payload = {
      status: currentTaskForm.status,
      progress: currentTaskForm.progress
    }

    // Giả định bạn đã có api updateTask trong employeeApi
    // Nếu chưa có, hãy thêm hàm: updateTask(id, data) => axios.put(...)
    await taskApi.updateTask(currentTaskForm.id, payload)

    // Tắt modal và load lại dữ liệu
    closeModal()
    showToast('Update Successfully!', 'success')
    await loadAllData() // Reload để cập nhật list và thống kê

    // Hiển thị thông báo thành công


  } catch (error) {
    console.error("Update failed:", error)
    showToast('Failed to update task. Please try again.', 'danger')
  } finally {
    updateLoading.value = false
  }
}

onMounted(() => {
  loadAllData()
})
</script>

<template>
  <div class="container py-4 position-relative">
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1060">
      <div
        class="toast align-items-center text-white border-0 show"
        :class="'bg-' + toastState.type"
        role="alert"
        v-if="toastState.show"
      >
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi" :class="toastState.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
            {{ toastState.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toastState.show = false"></button>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark">My Workspace</h2>
        <p class="text-muted mb-0" v-if="employee">
          Hello, <strong class="text-primary">{{ employee.name }}</strong>
        </p>
      </div>
      <div class="d-flex gap-3 align-items-center">
        <div class="d-none d-md-block text-end border-end pe-3" v-if="manager">
          <small class="text-muted d-block text-uppercase" style="font-size: 0.7rem;">Direct Manager</small>
          <span class="fw-bold text-dark">{{ manager }}</span>
        </div>
        <LogoutBtn />
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else>
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm h-100 bg-light">
            <div class="card-body">
              <h6 class="text-uppercase text-muted small">Total Tasks</h6>
              <h2 class="mb-0 fw-bold text-dark">{{ stats.total }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm h-100 bg-warning text-white">
            <div class="card-body">
              <h6 class="text-uppercase opacity-75 small">To Do</h6>
              <h2 class="mb-0 fw-bold">{{ stats.todo }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm h-100 bg-primary text-white">
            <div class="card-body">
              <h6 class="text-uppercase opacity-75 small">In Progress</h6>
              <h2 class="mb-0 fw-bold">{{ stats.doing }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm h-100 bg-success text-white">
            <div class="card-body">
              <h6 class="text-uppercase opacity-75 small">Completed</h6>
              <h2 class="mb-0 fw-bold">{{ stats.done }}</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0 fw-bold">Assigned Tasks</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
              <tr>
                <th class="ps-4">Task Name</th>
                <th>Project</th>
                <th>Timeline</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
              </thead>
              <tbody>
              <tr
                v-for="task in tasks"
                :key="task.id"
                @click="openUpdateModal(task)"
                style="cursor: pointer;"
                title="Click to update progress"
              >
                <td class="ps-4">
                  <div class="fw-bold">{{ task.name }}</div>
                  <small class="text-muted text-truncate d-block" style="max-width: 200px;">
                    {{ task.description }}
                  </small>
                </td>
                <td>
                    <span class="badge bg-light text-dark ">
                      <i class="bi bi-folder me-1"></i>
                      {{ task.project?.name || 'Unknown Project' }}
                    </span>
                </td>
                <td>
                  <small class="d-block text-muted">Start: {{ task.start_date }}</small>
                  <small class="d-block text-danger fw-bold">Due: {{ task.end_date }}</small>
                </td>
                <td style="width: 25%">
                  <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1" style="height: 6px;">
                      <div class="progress-bar" :class="'bg-' + getStatusColor(task.status)"
                           role="progressbar" :style="{ width: task.progress + '%' }"></div>
                    </div>
                    <span class="ms-2 small fw-bold">{{ task.progress }}%</span>
                  </div>
                </td>
                <td>
                    <span class="badge rounded-pill text-uppercase" :class="'bg-' + getStatusColor(task.status)">
                      {{ task.status }}
                    </span>
                </td>
              </tr>
              <tr v-if="tasks.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">No tasks assigned yet.</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade show" v-if="isModalOpen" style="display: block; background: rgba(0,0,0,0.5)" @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered modal-lg"> <div class="modal-content border-0 shadow">

        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold">
            <i class="bi bi-pencil-square me-2"></i> Update Task Progress
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
        </div>

        <div class="modal-body p-4">
          <form @submit.prevent="handleUpdateTask">

            <div class="row g-3 mb-4">
              <div class="col-12">
                <label class="text-uppercase text-muted fw-bold small mb-1">Project / Job Name</label>
                <div class="d-flex align-items-center p-2 bg-light rounded border-start border-4 border-primary">
                  <i class="bi bi-briefcase-fill text-primary me-2 fs-5"></i>
                  <span class="fw-bold fs-5 text-dark">{{ currentTaskForm.project_name }}</span>
                </div>
              </div>

              <div class="col-md-12">
                <label class="text-uppercase text-muted fw-bold small mb-1">Task Name</label>
                <div class="border-bottom pb-2 fs-5 fw-bold text-dark">
                  {{ currentTaskForm.name }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="text-uppercase text-muted fw-bold small mb-1">Start Date</label>
                <div class="text-dark fw-medium">
                  <i class="bi bi-calendar-check me-1 text-success"></i> {{ currentTaskForm.start_date }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="text-uppercase text-muted fw-bold small mb-1">Due Date</label>
                <div class="text-dark fw-medium">
                  <i class="bi bi-calendar-x me-1 text-danger"></i> {{ currentTaskForm.end_date }}
                </div>
              </div>

              <div class="col-12">
                <label class="text-uppercase text-muted fw-bold small mb-1">Description</label>
                <div class="p-3 bg-light rounded border text-secondary" style="min-height: 80px; white-space: pre-line;">
                  {{ currentTaskForm.description || 'No description provided.' }}
                </div>
              </div>
            </div>

            <hr class="my-4"> <h6 class="fw-bold text-primary mb-3">Your Progress Update</h6>

            <div class="row g-3">
              <div class="col-md-5">
                <label class="form-label fw-bold">Status <span class="text-danger">*</span></label>
                <select class="form-select" v-model="currentTaskForm.status">
                  <option value="todo">To Do</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                  <option value="review">Review</option>
                </select>
              </div>

              <div class="col-md-7">
                <label class="form-label fw-bold d-flex justify-content-between">
                  <span>Current Progress</span>
                  <span class="badge bg-primary">{{ currentTaskForm.progress }}%</span>
                </label>
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-circle small text-muted"></i>
                  <input
                    type="range"
                    class="form-range"
                    v-model.number="currentTaskForm.progress"
                    min="0" max="100" step="5"
                  >
                  <i class="bi bi-check-circle-fill small text-success"></i>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
              <button type="button" class="btn btn-outline-secondary px-4" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary px-4" :disabled="updateLoading">
                <span v-if="updateLoading" class="spinner-border spinner-border-sm me-1"></span>
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Hiệu ứng hover cho card thống kê */
.card { transition: transform 0.2s; }
.card:hover { transform: translateY(-2px); }

/* Table styles */
.table th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #6c757d;
}
/* Hiệu ứng hover cho dòng trong bảng để biết là click được */
tbody tr:hover {
  background-color: #f8f9fa;
  transform: scale(1.005);
  transition: all 0.1s;
}

/* Custom Range Input Color */
.form-range::-webkit-slider-thumb {
  background: #0d6efd;
}
.toast {
  transition: opacity 0.3s ease-in-out;
}
</style>