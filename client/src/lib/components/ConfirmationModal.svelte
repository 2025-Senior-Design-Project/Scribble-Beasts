<script lang="ts">
  import { type Snippet } from 'svelte';

  let {
    show = $bindable(false),
    title = 'Are you sure?',
    message = '',
    onConfirm,
    onCancel,
  }: {
    show: boolean;
    title?: string;
    message?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } = $props();

  function handleCancel() {
    show = false;
    onCancel?.();
  }

  function handleConfirm() {
    show = false;
    onConfirm();
  }
</script>

{#if show}
  <div class="modal-backdrop" onclick={handleCancel}>
    <div class="paper-card modal-card" onclick={(e) => e.stopPropagation()}>
      <h2 class="text-pen-red">{title}</h2>
      {#if message}
        <p>{message}</p>
      {/if}
      <div class="modal-actions">
        <button class="cancel-button" onclick={handleCancel}>Cancel</button>
        <button class="confirm-button" onclick={handleConfirm}>Confirm</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  .modal-card {
    max-width: 25rem;
    transform: rotate(-1deg);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  h2 {
    margin: 0;
  }

  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .cancel-button {
    background-color: #95a5a6;
  }

  .cancel-button:hover {
    background-color: #7f8c8d;
  }

  .confirm-button {
    background-color: var(--pen-red);
  }

  .confirm-button:hover {
    background-color: #c0392b;
  }
</style>
