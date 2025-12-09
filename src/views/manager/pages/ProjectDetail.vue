<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import projectApi from '@/api/manager/projectApi.ts'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const projectInfo = ref(null)
const id = Number(route.params.id)
const employees = inject('employees');

async function loadInfo() {
  try {
    const res = await projectApi.getProjectById(id)
    projectInfo.value = res.data.data
    console.log(res)
  } catch (error) {
    console.log(error)
  }
}
onMounted(loadInfo)
</script>

<template>
  ProjectDetails
  {{ projectInfo }}
</template>

<style scoped></style>
