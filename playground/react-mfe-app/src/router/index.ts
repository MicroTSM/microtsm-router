import {
  createRouter,
  createWebHistory,
  type RouteRecord,
} from "@microtsm/router";
import ReactLayout from "../view/ReactLayout";
import TransactionView from "../view/TransactionView";
import HistoryView from "../view/HistoryView";
import { defineRouteComponent } from "@microtsm/react";

const routes: Array<RouteRecord> = [
  {
    path: "/react",
    name: "React View",
    component: defineRouteComponent(ReactLayout),
    redirect: { name: "React Transaction View" },
    children: [
      {
        path: "transaction",
        name: "React Transaction View",
        component: defineRouteComponent(TransactionView),
      },
      {
        path: "history",
        name: "React History View",
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
