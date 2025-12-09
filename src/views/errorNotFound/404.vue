<script setup lang="ts">

</script>

<template>
  <section class="page_404 d-flex align-items-center justify-content-center">
    <div class="container text-center">
      <div class="four_zero_four_bg">
        <h1 class="text-center">404</h1>
      </div>
      <div class="contant_box_404">
        <h3 class="h2"></h3>
        <RouterLink to="/" class="link_404">
          ➜ Back
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page_404 {
  padding: 40px 0;
  background: #fff;
  font-family: 'Arvo', serif;
  min-height: 100vh;
}

.four_zero_four_bg {
  background-image: url("https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif");
  height: 400px;
  background-position: center;
  background-repeat: no-repeat;
}

.four_zero_four_bg h1 {
  font-size: 80px;
  font-weight: 700;
}

.link_404 {
  color: #fff !important;
  padding: 10px 25px;
  background: #39ac31;
  margin: 20px 0;
  display: inline-block;
  border-radius: 30px;
  transition: 0.2s ease;
  text-decoration: none;
}

.link_404:hover {
  background: #2e8a28;
}

.contant_box_404 {
  margin-top: -50px;
}

/* Responsive cho mobile */
@media (max-width: 576px) {
  .four_zero_four_bg {
    height: 250px;
    background-size: contain;
  }

  .four_zero_four_bg h1 {
    font-size: 50px;
  }

  .contant_box_404 {
    margin-top: -20px;
  }
}
</style>
