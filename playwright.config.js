import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',testMatch:'*.spec.js',use:{baseURL:'http://127.0.0.1:5173',headless:true,launchOptions:process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}},webServer:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},reporter:'list'});
