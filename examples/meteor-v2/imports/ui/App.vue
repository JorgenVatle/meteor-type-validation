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

      <div>
        <h1 class="text-2xl">Todos</h1>
      </div>
      <div>
        <div v-if="!user.loggedIn">
          <p>You need to log in before you can view todos</p>
          <button @click="user.login()" class="btn">Login</button>
        </div>
        <div v-else-if="user.loading">
          <p>Waiting on login...</p>
        </div>
        <div>
          <p>Todos should appear here</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useCurrentUser } from './composition/users/useCurrentUser';

const count = ref(0);
const user = useCurrentUser();
</script>