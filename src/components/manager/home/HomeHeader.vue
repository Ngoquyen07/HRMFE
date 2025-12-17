<script setup lang="ts">
  const props = defineProps<{
    manager : any,
    openCreateModal : () => void,
  }>();
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 class="fw-bold text-dark">Dashboard</h2>
      <p class="text-muted mb-0" v-if="props.manager">
        Welcome back, <strong class="text-primary">{{ props.manager.name }}</strong>
      </p>
    </div>
    <div>
      <button
        @click="props.openCreateModal"
        class="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
      >
        <i class="bi bi-plus-lg"></i> <span>New Project</span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
