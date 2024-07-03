import { defineConfig, type UserConfig } from 'vitest/config';

export default defineConfig(() => {
  const config: UserConfig = {
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  };

  return config;
});
