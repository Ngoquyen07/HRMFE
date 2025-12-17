<script setup lang="ts">
const props = defineProps<{
  projectInfo : any,
  formatDate :(date:any) => string,
  projectErrors : any ,
  hasProjectChanged : boolean,
  handleUpdateProject :() => void,
  handleDeleteProject :() => void
}>();

// Màu sắc cho Progress Bar
const getProgressColor = (progress: number) => {
  if (progress === 100) return 'bg-success'
  if (progress >= 50) return 'bg-primary'
  return 'bg-warning'
}
</script>

<template>
  <div class="card mb-4 shadow-sm">
    <div class="card-header bg-primary text-white">General Information</div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-6">
          <p><strong>Manager:</strong> {{ props.projectInfo.manager?.name }}</p>
          <p><strong>Start Date:</strong> {{ props.formatDate(props.projectInfo.start_date) }}</p>
          <p><strong>End Date:</strong> {{ props.formatDate(props.projectInfo.end_date) }}</p>
          <p><strong>Created At:</strong> {{ props.formatDate(props.projectInfo.created_at) }}</p>
        </div>

        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Status</label>
            <select
              class="form-select"
              style="max-width: 200px;"
              v-model="props.projectInfo.status"
              :class="{ 'is-invalid': props.projectErrors.status }"
            >
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div class="invalid-feedback" v-if="props.projectErrors.status">
              {{ props.projectErrors.status[0] }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold d-flex justify-content-between">
              <span>Progress</span>
              <span class="badge" :class="getProgressColor(props.projectInfo.progress)">
                {{ props.projectInfo.progress }}%
              </span>
            </label>

            <div class="d-flex align-items-center">
              <input
                type="range"
                class="form-range"
                v-model.number="props.projectInfo.progress"
                min="0"
                max="100"
                step="1"
                :class="{ 'is-invalid': props.projectErrors.progress }"
              />
            </div>

            <div class="invalid-feedback d-block" v-if="props.projectErrors.progress">
              {{ props.projectErrors.progress[0] }}
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-12">
          <label class="fw-bold form-label">Description:</label>
          <textarea
            class="form-control"
            rows="4"
            v-model="props.projectInfo.description"
            placeholder="Enter project description..."
          ></textarea>
        </div>
      </div>

      <div class="d-flex justify-content-between mt-4">

        <button
          class="btn btn-outline-danger"
          @click="props.handleDeleteProject"
        >
          <i class="bi bi-trash me-1"></i> Delete Project
        </button>

        <button
          class="btn btn-success px-5"
          :disabled="!props.hasProjectChanged"
          @click="props.handleUpdateProject"
        >
          <i class="bi bi-save me-1"></i> Save changes
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>