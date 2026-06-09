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

export default router;
