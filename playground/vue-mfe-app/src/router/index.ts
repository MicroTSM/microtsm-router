import {
  createRouter,
  createWebHistory,
  type RouteRecord,
} from "@microtsm/router";
import VueLayout from "../view/VueLayout.vue";
import TransactionView from "../view/TransactionView.vue";
import HistoryView from "../view/HistoryView.vue";
import { defineRouteComponent } from "@microtsm/vue";

const routes: Array<RouteRecord> = [
  {
    path: "/vue",
    name: "Vue View",
    component: defineRouteComponent(VueLayout),
    redirect: { name: "Transaction View" },
    children: [
      {
        path: "transaction",
        name: "Transaction View",
        component: defineRouteComponent(TransactionView),
      },
      {
        path: "history",
        name: "History View",
        component: defineRouteComponent(HistoryView),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Contoh Penggunaan Middleware Lokal secara async (Router-Level Guard)
router.beforeEach(async (to, from) => {
  console.log(
    `[Vue MFE Middleware] Berpindah dari ${from.path} menuju ${to.path}`,
  );

  if (to.path === "/vue/history") {
    // Set isPremiumUser ke true untuk lanjut
    const isPremiumUser = await new Promise((resolve) => {
      setTimeout(() => resolve(false), 1000);
    });

    if (!isPremiumUser) {
      console.warn(
        "🚫 [Vue MFE] Anda harus menjadi Premium User untuk melihat History!",
      );
      alert("Maaf, fitur History hanya untuk Premium User.");
      return "/vue/transaction";
    }
  }

  return true;
});

export default router;
