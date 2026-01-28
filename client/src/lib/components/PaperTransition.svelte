<script lang="ts">
  import { type Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    class?: string;
  }

  let { children, class: className = '' } = $props();

  function useCssAnimation(
    node: HTMLElement,
    { duration, cls }: { duration: number; cls: string },
  ) {
    // Add the class that triggers the CSS animation
    node.classList.add(cls);

    return {
      duration,
    };
  }
</script>

<div
  class={['paper-transition', className].join(' ')}
  in:useCssAnimation={{ duration: 800, cls: 'animate-throw-in' }}
  out:useCssAnimation={{ duration: 1000, cls: 'animate-fall-out' }}
>
  {@render children()}
</div>

<style>
  .paper-transition {
    /* Ensure the wrapper doesn't block interactions, but children do */
    pointer-events: none;
  }

  /* We need to ensure children are interactive */
  .paper-transition > :global(*) {
    pointer-events: auto;
  }

  /* Animations */
  :global(.animate-throw-in) {
    animation: throwIn 0.8s cubic-bezier(0.33, 1, 0.68, 1) forwards;
  }

  :global(.animate-fall-out) {
    animation: fallOut 1s linear forwards;
  }

  @keyframes throwIn {
    0% {
      transform: translate(500px, -500px) rotate(20deg);
      opacity: 0;
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes fallOut {
    /* 
       Imitates the 2-stage fall:
       0% - 40% (of time, so 0-0.4t): Move down slightly
       40% - 100%: Fall down and fade
    */
    0% {
      transform: translateY(0);
      opacity: 1;
      filter: brightness(1);
    }
    40% {
      transform: translateY(30px);
      opacity: 1;
      filter: brightness(0.8);
    }
    100% {
      transform: translateY(200px);
      opacity: 0;
      filter: brightness(0.8);
    }
  }
</style>
