<script setup lang="ts">
import { ref } from "vue";

const historyLogs = ref([
  { time: "10:05", event: "User login", ip: "192.168.1.10" },
  { time: "09:42", event: "Updated settings configuration", ip: "192.168.1.10" },
  { time: "08:15", event: "Database backup auto-run", ip: "localhost" }
]);
</script>

<template>
  <div>
    <h2 class="text-lg font-bold text-gray-800 mb-4">Riwayat Aktivitas</h2>
    <div class="space-y-3">
      <div v-for="log in historyLogs" :key="log.time" class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-all duration-200">
        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">
            {{ log.time }}
          </span>
          <p class="text-sm font-medium text-gray-800">{{ log.event }}</p>
        </div>
        <span class="text-xs text-gray-500 font-mono">{{ log.ip }}</span>
      </div>
    </div>
  </div>
</template>
