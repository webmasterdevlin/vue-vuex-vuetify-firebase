import Vue from "vue";
import Router from "vue-router";
import Calendar from "./views/Calendar";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "",
      redirect: { name: "calendar" }
    },
    {
      path: "/calendar",
      name: "calendar",
      component: Calendar
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});
