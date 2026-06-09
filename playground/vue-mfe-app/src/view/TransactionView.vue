<script setup lang="ts">
import { ref } from "vue";

const transactions = ref([
  { id: "TX-1001", date: "2026-06-08", amount: "Rp 150.000", status: "Success", desc: "Server Subscription" },
  { id: "TX-1002", date: "2026-06-07", amount: "Rp 450.000", status: "Success", desc: "Domain Registration" },
  { id: "TX-1003", date: "2026-06-05", amount: "Rp 95.000", status: "Pending", desc: "API Gateway Credit" }
]);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-800">Daftar Transaksi</h2>
      <button class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition duration-200">
        + Buat Transaksi
      </button>
    </div>
    
    <div class="overflow-hidden border border-gray-100 rounded-lg">
      <table class="min-w-full divide-y divide-gray-100 bg-white text-left text-sm">
        <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <tr>
            <th class="px-4 py-3">ID</th>
            <th class="px-4 py-3">Deskripsi</th>
            <th class="px-4 py-3">Tanggal</th>
            <th class="px-4 py-3">Jumlah</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50/70">
            <td class="px-4 py-3 font-semibold text-blue-600">{{ tx.id }}</td>
            <td class="px-4 py-3 text-gray-700">{{ tx.desc }}</td>
            <td class="px-4 py-3 text-gray-500">{{ tx.date }}</td>
            <td class="px-4 py-3 font-medium text-gray-900">{{ tx.amount }}</td>
            <td class="px-4 py-3">
              <span 
                :class="{
                  'bg-green-50 text-green-700 border-green-200': tx.status === 'Success',
                  'bg-yellow-50 text-yellow-700 border-yellow-200': tx.status === 'Pending'
                }"
                class="px-2 py-0.5 text-xs font-medium rounded border"
              >
                {{ tx.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
