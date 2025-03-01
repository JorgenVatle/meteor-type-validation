<template>
  <div class="container mx-auto py-16">
    <div class="grid gap-8">
      <div>
        <h1 class="text-2xl font-bold">
          Hello Vue!
        </h1>
      </div>
      <div>
        <button @click="count++" class="btn">This button has been clicked {{ count }} times</button>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const count = ref(0);
</script>