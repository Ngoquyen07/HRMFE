<script setup lang="ts">
import { reactive } from "vue"

type ToastType = "success" | "danger"

const state = reactive({
  show: false,
  message: "",
  type: "success" as ToastType,
})

let timer: number | null = null

function show(message: string, type: ToastType = "success", duration = 3000) {
  state.message = message
  state.type = type
  state.show = true

  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    state.show = false
    timer = null
  }, duration)
}

function hide() {
  state.show = false
  if (timer) {
    window.clearTimeout(timer)
    timer = null
  }
}

// Cho component cha gọi
defineExpose({ show, hide })
</script>

<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1060">
    <div
      v-if="state.show"
      class="toast align-items-center text-white border-0 show"
      :class="'bg-' + state.type"
      role="alert"
    >
      <div class="d-flex">
        <div class="toast-body">
          <i
            class="bi"
            :class="state.type === 'success'
              ? 'bi-check-circle-fill'
              : 'bi-exclamation-triangle-fill'"
          ></i>
          {{ state.message }}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="hide"></button>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .toast {
    transition: opacity 0.3s ease-in-out;
  }
</style>

