<script setup lang="ts">
const props = defineProps<{
  name: string;
}>();
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Project Details: {{ props.name }}</h2>
    <button class="btn btn-secondary" @click="$router.back()">Back</button>
  </div>
</template>

<style scoped></style>
