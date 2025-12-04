import App from './App.svelte';
import { mount } from 'svelte';
import './styles/main.css';

const target = document.getElementById('app');
if (!target) {
  throw new Error('Could not find app element');
}

// @ts-ignore - Svelte 5 types are still in development
mount(App, { target });
