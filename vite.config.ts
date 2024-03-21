import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BASE_SITE_URL = process.env.BASE_SITE_URL || '/';
// https://vitejs.dev/config/
export default defineConfig({
    base: BASE_SITE_URL,
    plugins: [react()],
});
