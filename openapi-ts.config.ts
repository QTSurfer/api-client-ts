import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://raw.githubusercontent.com/QTSurfer/qtsurfer-api/main/openapi.yaml',
  output: {
    path: './src/generated',
    format: 'prettier',
  },
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/sdk',
      client: '@hey-api/client-fetch',
    },
    {
      name: '@hey-api/schemas',
      type: 'json',
    },
  ],
});
