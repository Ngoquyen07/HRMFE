<script setup lang="ts">
import LogoutBtn from '@/components/buttons/LogoutBtn.vue'
import managerApi from '@/api/manager/managerApi'
import { onMounted, ref, computed, provide } from 'vue'
import { useRouter } from 'vue-router'

// Data
const manager = ref<any>(null)
const employees = ref<any[]>([])
const projects = ref<any[]>([])
const loading = ref(false)
const error = ref('')

// --- STATISTICS CALCULATION LOGIC (COMPUTED) ---
const stats = computed(() => {
  const total = projects.value.length
  // Filter for 'done' status
  const done = projects.value.filter((p) => p.status === 'done').length
  // Filter for active statuses
  const active = projects.value.filter((p) => ['active', 'processing'].includes(p.status)).length
  // Filter for pending statuses
  const pending = projects.value.filter((p) => ['new', 'pending'].includes(p.status)).length

  // Calculate % completion for progress bar
  const percentDone = total > 0 ? Math.round((done / total) * 100) : 0

  return { total, done, active, pending, percentDone }
})

// Function to get color for status (used for Badge)
const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'success' // Green
    case 'active':
      return 'primary' // Blue
    case 'pending':
      return 'warning' // Yellow
    case 'cancelled':
      return 'danger' // Red
    default:
      return 'secondary' // Grey
  }
}

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
    console.error('Error:', err)
    error.value = 'Failed to load data.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
const router = useRouter()

function goToProject(id: number) {
  router.push(`/manager/projects/${id}`)
}
provide('employees', employees);
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark">Dashboard</h2>
        <p class="text-muted mb-0" v-if="manager">
          Welcome back, <strong class="text-primary">{{ manager.name }}</strong>
        </p>
      </div>
      <LogoutBtn />
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else>
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm h-100 bg-primary text-white">
            <div class="card-body">
              <h6 class="text-uppercase opacity-75 small">Total Projects</h6>
              <h2 class="mb-0 fw-bold">{{ stats.total }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm h-100 bg-info text-white">
            <div class="card-body">
              <h6 class="text-uppercase opacity-75 small">In Progress</h6>
              <h2 class="mb-0 fw-bold">{{ stats.active }}</h2>
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
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm h-100 bg-white">
            <div class="card-body">
              <h6 class="text-uppercase text-muted small">Total Employees</h6>
              <h2 class="mb-0 fw-bold text-dark">{{ employees.length }}</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 fw-bold">Project Status Overview</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="bg-light">
                    <tr>
                      <th class="ps-4">Project Name</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="pj in projects"
                      :key="pj.id"
                      @click="goToProject(pj.id)"
                      style="cursor: pointer"
                    >
                      <td class="ps-4 fw-medium">{{ pj.name }}</td>
                      <td style="width: 40%">
                        <div class="d-flex align-items-center">
                          <div class="progress flex-grow-1" style="height: 6px">
                            <div
                              class="progress-bar"
                              :class="'bg-' + getStatusColor(pj.status)"
                              role="progressbar"
                              :style="{ width: (pj.progress || 0) + '%' }"
                            ></div>
                          </div>
                          <span class="ms-2 small text-muted">{{ pj.progress || 0 }}%</span>
                        </div>
                      </td>
                      <td>
                        <span
                          class="badge rounded-pill text-uppercase"
                          :class="'bg-' + getStatusColor(pj.status)"
                        >
                          {{ pj.status }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="projects.length === 0">
                      <td colspan="3" class="text-center py-3 text-muted">No projects found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card shadow-sm border-0">
            <div
              class="card-header bg-white py-3 d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0 fw-bold">Team Members</h5>
              <span class="badge bg-light text-dark border">{{ employees.length }}</span>
            </div>
            <ul class="list-group list-group-flush">
              <li
                v-for="emp in employees"
                :key="emp.id"
                class="list-group-item d-flex align-items-center py-3 border-0 border-bottom"
              >
                <div>
                  <h6 class="mb-0 text-dark">{{ emp.name }}</h6>
                  <small class="text-muted" style="font-size: 0.8rem">{{ emp.email }}</small>
                </div>
              </li>
              <li v-if="employees.length === 0" class="list-group-item text-center text-muted py-3">
                No employees assigned
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add a slight shadow when hovering over the card */
.card:hover {
  transition: transform 0.2s;
}
.table th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #6c757d;
}
</style>