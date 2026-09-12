import type { StorybookConfig } from '@storybook/vue3-vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';

const config: StorybookConfig = {
  stories: [
    '../app/components/**/*.mdx',
    '../app/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  viteFinal: async (config) => {
    if (!config.plugins) {
      config.plugins = [];
    }
    config.plugins.push(vue());

    if (!config.resolve) {
      config.resolve = {};
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../app'),
      '~': path.resolve(__dirname, '../app'),
    };
    return config;
  }
};

export default config;
