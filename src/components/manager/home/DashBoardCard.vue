<script setup lang="ts">
const props = defineProps<{
  color:string,
  title :string ,
  count :any
  }>();
</script>

<template>
  <div class="col-md-3 col-6">
    <div class="card border-0 shadow-sm h-100  text-white"
         :class="props.color" >
      <div class="card-body">
        <h6 class="text-uppercase opacity-75 small">{{props.title}}</h6>
        <h2 class="mb-0 fw-bold">{{ props.count }}</h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { transition: transform 0.2s; }
.card:hover { transform: translateY(-2px); }

</style>