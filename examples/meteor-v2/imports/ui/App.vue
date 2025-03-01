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
        <div class="grid gap-6" v-else>
          <p>
            Logged in as <span class="text-indigo-200 font-medium">{{ user.data?.emails?.[0].address }}</span>
          </p>
          <div class="py-8">
            <div class="grid grid-cols-[4rem,1fr] py-3" v-for="todo in todos.data">
              <div class="pt-1">
                <input type="checkbox" class="checkbox" :checked="todo.completed" @click="todos.complete(todo)">
              </div>
              <div>
                <div>{{ todo.title }}</div>
                <div class="text-gray-500 text-xs">{{ todo.userId }}</div>
              </div>
            </div>
            <form class="flex gap-4" @submit.prevent="todos.create">
              <div class="w-full max-w-sm">
                  <label for="title" class="label label-text">Todo title</label>
                  <input id="title" type="text" class="input input-bordered w-full" autocomplete="false" v-model="todos.form.title" :placeholder="todos.form.placeholder">
              </div>
              <button class="btn btn-primary self-end">Add todo</button>
            </form>
          </div>
          <div>
            <button class="btn" @click="user.logout()">Log out</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useTodos } from './composition/todos/useTodos';
import { useCurrentUser } from './composition/users/useCurrentUser';

const count = ref(0);
const user = useCurrentUser();
const todos = useTodos();
</script>