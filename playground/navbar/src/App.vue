<script setup>
import { ref } from "vue";
import { useRouter } from "@microtsm/router";

const router = useRouter();
const fontFamily = `"Work Sans", "Noto Sans", sans-serif`;

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div
    class="bg-white w-[214px] h-screen overflow-auto px-4 pb-2 flex flex-col border-r border-gray-200"
    :style="{ fontFamily: fontFamily }"
  >
    <div
      class="py-3 text-xs text-gray-900 font-medium tracking-wide uppercase mt-4"
    >
      Menu
    </div>

    <div class="flex flex-col gap-1">
      <div
        class="flex items-center gap-2 w-full px-[8px] py-[5px] rounded cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-800"
        @click="navigateTo('/vue')"
      >
        <!-- Mock icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        Vue MFE
      </div>

      <div
        class="flex items-center gap-2 w-full px-[8px] py-[5px] rounded cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-800"
        @click="navigateTo('/react')"
      >
        <!-- Mock icon for React -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        React MFE
      </div>

      <div
        class="flex items-center gap-2 w-full px-[8px] py-[5px] rounded cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-800"
        @click="navigateTo('/')"
      >
        <!-- Mock icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        Go Home
      </div>

      <div
        class="flex items-center gap-2 w-full px-[8px] py-[5px] rounded cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-800"
        @click="navigateTo('/another-path')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        Settings
        <span
          class="bg-red-500 text-white py-[3px] ml-auto rounded-full flex justify-center items-center w-[18px]"
        >
          <span class="text-[9px] leading-3 font-semibold tracking-[0.22px]"
            >2</span
          >
        </span>
      </div>
    </div>
  </div>
</template>
