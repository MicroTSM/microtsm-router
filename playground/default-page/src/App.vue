<script setup lang="ts">
import { useRouter } from "@microtsm/router";

const router = useRouter();

const handleReturnHomePage = () => {
  router.push("/vue");
};
</script>

<template>
  <div
    class="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
    style="
      font-family:
        &quot;Plus Jakarta Sans&quot;, &quot;Noto Sans&quot;, sans-serif;
    "
  >
    <div class="layout-container flex h-full grow flex-col">
      <div class="px-40 flex flex-1 justify-center py-5">
        <div
          class="layout-content-container flex flex-col max-w-[960px] flex-1"
        >
          <div class="@container">
            <div class="@[480px]:px-4 @[480px]:py-3">
              <div
                class="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-lg min-h-[218px]"
                style="
                  background-image: url(&quot;https://lh3.googleusercontent.com/aida-public/AB6AXuCA2M3vqRKbCi4ofXcyKIcLAghDYd_M5VMAoDVtAJfmTL8oCK2R9_oxhbkSL7RUb0wK83e7JVR8wTctw2YzXLomDji4TLrQdfyZpBEMlADj1Zf-0teQUshT90e2DPzfwH9zICZPRwzbO-4tMuksNDhGTYFQfyWly4meIltdsFPG2-KXlxWOVHy-5eTTQVdkPIkbJrXklj1U_j-Y1PsE8PtiBWMgk9q1sY0-99ZGaf5vTzAzNMrYWnuXse3p0gycrIcSYUBvIYXtVV1m&quot;);
                "
              ></div>
            </div>
          </div>
          <h2
            class="text-[#141414] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5"
          >
            Oops! You've wandered off the path.
          </h2>
          <p
            class="text-[#141414] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center"
          >
            It seems you've stumbled upon a page that doesn't exist. Let's get
            you back on track.
          </p>
          <div class="flex px-4 py-3 justify-center">
            <button
              @click="handleReturnHomePage"
              class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#141414] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span class="truncate">Return to Homepage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
