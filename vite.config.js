import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env": {
      API_URL: JSON.stringify(process.env.VITE_API_URL),
    },
  },
});
