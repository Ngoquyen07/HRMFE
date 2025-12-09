<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  message: { type: String, default: "" }
});

const show = ref(false);

watch(
  () => props.message,
  (val) => {
    if (val) {
      show.value = true;
      setTimeout(() => (show.value = false), 2500);
    }
  }
);
</script>

<template>
  <div
    class="toast text-white bg-success position-fixed top-0 end-0 m-3 px-3 py-2 rounded shadow"
    :class="{ show: show }"
    style="z-index: 9999; opacity: 0; transition: opacity .3s;"
  >
    <div class="toast-body">{{ message }}</div>
  </div>
</template>

<style scoped>
.show {
  opacity: 1 !important;
}
</style>
