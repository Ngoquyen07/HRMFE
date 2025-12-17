<script setup lang="ts">
import type { Project } from '@/interfaces/Project.ts'

const props = defineProps<{
  projects : any,
  goToProject :(id:number) => void,
  getStatusColor :(status :string) => void,
}>();
</script>

<template>
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
              v-for="pj in props.projects"
              :key="pj.id"
              @click="props.goToProject(pj.id)"
              style="cursor: pointer"
            >
              <td class="ps-4 fw-medium">{{ pj.name }}</td>
              <td style="width: 40%">
                <div class="d-flex align-items-center">
                  <div class="progress flex-grow-1" style="height: 6px">
                    <div
                      class="progress-bar"
                      :class="'bg-' + props.getStatusColor(pj.status)"
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
                      :class="'bg-' + props.getStatusColor(pj.status)"
                    >
                      {{ pj.status }}
                    </span>
              </td>
            </tr>
            <tr v-if="props.projects.length === 0">
              <td colspan="3" class="text-center py-3 text-muted">No projects found</td>
            </tr>
            </tbody>
          </table>
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
