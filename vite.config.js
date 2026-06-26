import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const isGithubActions = !!process.env.GITHUB_ACTIONS;
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
const base = isGithubActions && repoName ? `/${repoName}/` : '/';

export default defineConfig({
  base,
  plugins: [
    tailwindcss(),
  ],
});

