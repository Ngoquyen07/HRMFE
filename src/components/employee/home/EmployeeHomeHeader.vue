<script setup lang="ts">
const props = defineProps<{
  employee: any ,
  manager: any ,
}>();
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 class="fw-bold text-dark">My Workspace</h2>
      <p class="text-muted mb-0" v-if="props.employee">
        Hello, <strong class="text-primary">{{ props.employee.name }}</strong>
      </p>
    </div>
    <div class="d-flex gap-3 align-items-center">
      <div class="d-none d-md-block text-end border-end pe-3" v-if="props.manager">
        <small class="text-muted d-block text-uppercase" style="font-size: 0.7rem;">Direct Manager</small>
        <span class="fw-bold text-dark">{{props. manager }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
