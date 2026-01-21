import { writable, derived } from 'svelte/store';

export const enum View {
  ROOM_FORM = 'ROOM_FORM',
  LOBBY = 'LOBBY',
  GAME = 'GAME',
}

export const currentView = writable<View>(View.ROOM_FORM);
export const currentPath = writable<string>(window.location.pathname);

export const currentSubRoute = derived(currentPath, ($path) => {
  if ($path === '/' || $path === '') return 'play';
  return $path.replace('/', '');
});

export function navigateTo(view: View) {
  console.log(`Navigating to ${view}`);
  currentView.set(view);

  // If we're navigating back to ROOM_FORM from within the app, reset the path to root
  if (view === View.ROOM_FORM && window.location.pathname !== '/') {
    window.history.pushState({}, '', '/');
    currentPath.set('/');
  }
}

export function navigateToPath(path: string) {
  console.log(`Navigating to path: ${path}`);
  window.history.pushState({}, '', path);
  currentPath.set(path);
  currentView.set(View.ROOM_FORM);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  currentPath.set(window.location.pathname);
  // For now, any direct URL navigation defaults to ROOM_FORM view
  // since LOBBY and GAME states are transient and socket-dependent.
  currentView.set(View.ROOM_FORM);
});
