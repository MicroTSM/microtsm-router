<script setup lang="ts">
import { useRouter, useRoute } from "@microtsm/router";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();

const path = computed<string>(() => route.path);

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div
    class="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto my-6"
  >
    <div
      class="flex items-center justify-between border-b border-gray-100 pb-4 mb-6"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Vue Micro-Frontend</h1>
        <p class="text-sm text-gray-500 mt-1">
          Menggunakan Router Web Component yang Terintegrasi
        </p>
      </div>
      <span
        class="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200"
      >
        Vue MFE Active
      </span>
    </div>

    <!-- Navigasi menggunakan Button + router.push sesuai standarisasi project -->
    <div class="flex gap-2 mb-6 bg-gray-50 p-1.5 rounded-lg w-fit">
      <button
        type="button"
        @click="navigateTo('/vue/transaction')"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer',
          path === '/vue/transaction'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900',
        ]"
      >
        Transaction View
      </button>
      <button
        type="button"
        @click="navigateTo('/vue/history')"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer',
          path === '/vue/history'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900',
        ]"
      >
        History View
      </button>
    </div>

    <!-- Sub-route router-view (Depth 1) -->
    <div
      class="bg-gray-50/50 border border-gray-100 rounded-xl p-6 min-h-[200px] transition-all duration-300"
    >
      <router-view></router-view>
    </div>
  </div>
</template>
