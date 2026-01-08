import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // 이 줄을 추가하세요 (설치 필요: npm install -D @types/node)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @를 src 폴더로 매핑
    },
  },
});
