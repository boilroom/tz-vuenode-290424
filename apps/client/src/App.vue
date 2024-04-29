<script setup>
import Card from './components/Card.vue'
</script>

<template>
  <main class="main-container">
    <Card product-id="1" />
    <Card product-id="2" />
  </main>
</template>

<style scoped>
  .main-container {
    padding: 40px;
    display: flex;
    gap: 40px;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #fffcec;
    box-sizing: border-box;
  }
  @media (max-width: 1024px) {
    .main-container {
      flex-direction: column;
    }
  }
</style>

