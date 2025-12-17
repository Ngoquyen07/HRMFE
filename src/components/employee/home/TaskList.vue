<script setup lang="ts">
const props = defineProps<{
  tasks : any,
  openUpdateModal :(task :any) => void,
}>();
const getStatusColor = (status: string) => {
  switch (status) {
    case 'done': return 'success'
    case 'doing': return 'primary'
    case 'todo': return 'warning'
    default: return 'secondary'
  }
}
</script>

<template>
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
          v-for="task in props.tasks"
          :key="task.id"
          @click="props.openUpdateModal(task)"
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
        <tr v-if="props.tasks.length === 0">
          <td colspan="5" class="text-center py-4 text-muted">No tasks assigned yet.</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.card { transition: transform 0.2s; }
.card:hover { transform: translateY(-2px); }

.table th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #6c757d;
}
tbody tr:hover {
  background-color: #f8f9fa;
  transform: scale(1.005);
  transition: all 0.1s;
}
</style>
