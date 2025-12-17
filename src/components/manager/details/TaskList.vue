<script setup lang="ts">
const props = defineProps<{
  projectInfo : any,
  openCreateModal :() => void,
  openEditModal :(task : any) => void,
  formatDate :(date:any) => string,

}>();
// Badge màu sắc cho Status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'todo':
      return 'bg-secondary'
    case 'doing':
      return 'bg-primary'
    case 'review':
      return 'bg-info text-dark'
    case 'done':
      return 'bg-success'
    case 'cancelled':
      return 'bg-danger'
    default:
      return 'bg-light text-dark'
  }
}

// Màu sắc cho Progress Bar
const getProgressColor = (progress: number) => {
  if (progress === 100) return 'bg-success'
  if (progress >= 50) return 'bg-primary'
  return 'bg-warning'
}
</script>

<template>
  <div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Task List</h5>
      <button class="btn btn-primary btn-sm" @click="openCreateModal">
        <i class="bi bi-plus-circle"></i> Add New Task
      </button>
    </div>

    <div class="card-body p-0">
      <div v-if="props.projectInfo.tasks.length" class="table-responsive">
        <table class="table table-hover table-nowrap align-middle mb-0">
          <thead class="table-light">
          <tr class="text-uppercase text-secondary small fw-bold">
            <th style="width: 50px">ID</th>
            <th style="width: 120px">Task name</th>
            <th style="width: 120px">Assigned To</th>
            <th style="width: 100px">Status</th>
            <th style="width: 170px">Progress</th>
            <th style="width: 120px">Deadline</th>

          </tr>
          </thead>
          <tbody>
          <tr
            v-for="task in projectInfo.tasks"
            :key="task.id"
            @click="openEditModal(task)"
            style="cursor: pointer"
            title="Click to edit"
          >
            <td class="text-muted fw-bold">#{{ task.id }}</td>

            <td>
              <span class="fw-medium text-dark">{{ task.name }}</span>
            </td>

            <td>
              <div v-if="task.employee" class="d-flex align-items-center">
                <span>{{ task.employee.name }}</span>
              </div>
              <span v-else class="badge bg-light text-muted border">Unassigned</span>
            </td>
            <td>
                  <span class="badge rounded-pill" :class="getStatusBadge(task.status)">{{
                      task.status
                    }}</span>
            </td>

            <td>
              <div class="d-flex align-items-center">
                    <span class="me-2 small fw-bold text-muted" style="width: 45px"
                    >{{ task.progress }}%</span
                    >
                <div class="progress flex-grow-1" style="height: 6px; width: 100px">
                  <div
                    class="progress-bar rounded"
                    role="progressbar"
                    :style="{ width: task.progress + '%' }"
                    :class="getProgressColor(task.progress)"
                  ></div>
                </div>
              </div>
            </td>
            <td class="text-muted">
              <i class="bi bi-calendar-event me-1"></i> {{ formatDate(task.end_date) }}
            </td>

          </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-5">
        <i class="bi bi-clipboard-x text-muted" style="font-size: 2rem"></i>
        <p class="text-muted mt-2">No tasks found for this project.</p>
        <button class="btn btn-outline-primary btn-sm" @click="openCreateModal">
          Create First Task
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
