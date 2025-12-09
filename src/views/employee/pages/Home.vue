<script setup lang="ts">
  import LogoutBtn from '@/components/buttons/LogoutBtn.vue'
  import employeeApi from '@/api/employee/employeeApi.ts'
  const employee = employeeApi.getEmployee()
  console.log(employee)

</script>

<template>
  <h1>Employtee screen</h1>
  {{employee}}
  <LogoutBtn></LogoutBtn>
</template>

<style scoped></style>
