import { onRequestPost as __api_ask_js_onRequestPost } from "C:\\Users\\Nesitha\\Desktop\\website\\functions\\api\\ask.js"
import { onRequest as __api_ask_js_onRequest } from "C:\\Users\\Nesitha\\Desktop\\website\\functions\\api\\ask.js"

export const routes = [
    {
      routePath: "/api/ask",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_ask_js_onRequestPost],
    },
  {
      routePath: "/api/ask",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_ask_js_onRequest],
    },
  ]