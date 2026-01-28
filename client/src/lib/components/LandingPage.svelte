<script lang="ts">
  import RoomForm from './RoomForm.svelte';
  import { Rounds } from '@shared/rounds';
  import { currentSubRoute, navigateToPath } from '../Navigator';
  import { tick } from 'svelte';
  import npmPackages from '../constants/npm-credits.json';
  import { assetCredits } from '../constants/asset-credits';

  /**
   * Bridges Svelte's transition system with pure CSS classes.
   * We must use JS to coordinate with Svelte's lifecycle (knowing when to remove the element),
   * but the animation itself is defined and executed entirely in CSS.
   */
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

  let showPlaytestInfo = $state(false);
  let isScrolled = $state(false);

  function togglePlaytestInfo() {
    showPlaytestInfo = !showPlaytestInfo;
  }

  function handleNav(e: MouseEvent, path: string) {
    e.preventDefault();
    navigateToPath(path);
  }

  // Improved scroll handler
  const handleScroll = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    isScrolled = scrollY > 5;
  };

  $effect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  });

  $effect(() => {
    // Scroll to top whenever the subroute changes
    if ($currentSubRoute) {
      tick().then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });
</script>

<nav class:scrolled={isScrolled}>
  <a
    href="/"
    class:active={$currentSubRoute === 'play'}
    onclick={(e) => handleNav(e, '/')}
  >
    Play!
  </a>
  <a
    href="/playtesting"
    class:active={$currentSubRoute === 'playtesting'}
    onclick={(e) => handleNav(e, '/playtesting')}
  >
    Playtesting
  </a>
  <a
    href="/about"
    class:active={$currentSubRoute === 'about'}
    onclick={(e) => handleNav(e, '/about')}
  >
    About
  </a>
  <a
    href="/rules"
    class:active={$currentSubRoute === 'rules'}
    onclick={(e) => handleNav(e, '/rules')}
  >
    Rules
  </a>
  <a
    href="/credits"
    class:active={$currentSubRoute === 'credits'}
    onclick={(e) => handleNav(e, '/credits')}
  >
    Credits
  </a>
</nav>

<div
  class="landing-container relative"
  class:play-route={$currentSubRoute === 'play'}
>
  <div class="content-viewport">
    {#key $currentSubRoute}
      <div
        class="transition-wrapper"
        in:useCssAnimation={{ duration: 800, cls: 'animate-throw-in' }}
        out:useCssAnimation={{ duration: 1200, cls: 'animate-fall-out' }}
      >
        {#if $currentSubRoute === 'play'}
          <div class="room-form-wrapper">
            <RoomForm />
          </div>
        {:else if $currentSubRoute === 'playtesting'}
          <div class="paper-sheet">
            <div class="content playtesting">
              <h2>Next Playtest: Friday 23rd, 3:30-5:30</h2>
              <p>
                Join our <a
                  href="https://discord.gg/BQ4JUh8fCE"
                  target="_blank"
                  rel="noopener noreferrer">Discord Server</a
                > to participate! (That's where we host everything)
              </p>

              <h3>
                Alpha Playtesters <button
                  class="info-btn"
                  onclick={togglePlaytestInfo}
                  aria-label="What is alpha playtesting?">?</button
                >
              </h3>
              {#if showPlaytestInfo}
                <div class="info-tooltip">
                  Alpha is an early stage of development where the whole game
                  isn't finished and just core mechanics are being tested.
                </div>
              {/if}

              <div class="playtesters-list">
                <p class="empty-message">
                  Thank you to everyone who has playtested so far, we'll compile
                  your names here at a later date. You guys are integral to
                  making this game fun and deserve credit for it :D
                </p>
              </div>
            </div>
          </div>
        {:else if $currentSubRoute === 'about'}
          <div class="paper-sheet about-sheet">
            <div class="content about">
              Team Members
              <div class="team-grid">
                <div class="team-member">
                  <h3>Ethan Chaplin</h3>
                </div>
                <div class="team-member center">
                  <h3>Jasmine Mogadam</h3>
                </div>
                <div class="team-member">
                  <h3>Ana Cedillo</h3>
                </div>
              </div>

              <div class="project-info">
                <p>
                  This is our <a
                    href="https://github.com/2025-Senior-Design-Project/Scribble-Beasts"
                    target="_blank">UC Senior Design Project</a
                  >.
                </p>

                <div class="achievement">
                  <p>We placed 2nd in the Innovation Challenge!</p>
                  <img
                    src="/images/about/IC.jpeg"
                    alt="Jasmine holding a comically large check"
                  />
                </div>

                <div class="b-roll">
                  <img
                    src="/images/about/demo.jpeg"
                    alt="Jasmine demoing the game"
                  />
                </div>

                <div class="origin-story">
                  <p>
                    This game started as a physical drawing game in Jasmine's
                    "Intro to Game Design" class at UC.
                  </p>
                  <a href="/files/ogRules.pdf" target="_blank" class="pdf-link"
                    >View Original Physical Game Rules (PDF)</a
                  >
                </div>
              </div>
            </div>
          </div>
        {:else if $currentSubRoute === 'rules'}
          <div class="paper-sheet">
            <div class="content rules">
              <h2>Game Rules</h2>
              <p>Here is how the game works, round by round:</p>

              <div class="rounds-list">
                {#each Rounds as round}
                  <div class="round-item">
                    <h3>{round.roundName}</h3>
                    <p>{round.description}</p>
                  </div>
                {/each}
              </div>

              <div class="pdf-section">
                <a href="/files/ogRules.pdf" target="_blank" class="pdf-link"
                  >View Original Physical Card Game Rules</a
                >
              </div>
            </div>
          </div>
        {:else if $currentSubRoute === 'credits'}
          <div class="paper-sheet">
            <div class="content credits">
              <h2>Credits</h2>

              <div class="credits-section">
                <h3>Assets</h3>
                <ul class="asset-list">
                  {#each assetCredits as asset}
                    <li>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer">{asset.name}</a
                      >
                      <span class="attribution">
                        by {asset.author} — {asset.license}</span
                      >
                    </li>
                  {/each}
                </ul>
              </div>

              <div class="credits-section">
                <h3>Open Source Software</h3>
                <p>We use the following NPM packages:</p>
                <ul class="npm-list">
                  {#each npmPackages as pkg}
                    <li>
                      <a
                        href={pkg.url}
                        target="_blank"
                        rel="noopener noreferrer">{pkg.name}</a
                      >
                      {#if pkg.version}
                        <span class="version"> v{pkg.version}</span>
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/key}
  </div>
</div>

<style>
  .landing-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100dvh;
    width: 100%;
    max-width: 100vw; /* Ensure it doesn't exceed viewport */
    overflow-x: hidden; /* Clip animations */
    padding: 0 0 4rem 0; /* Padding at bottom of the page */
    box-sizing: border-box;
  }

  .landing-container.play-route {
    padding-bottom: 0;
  }

  .content-viewport {
    margin-top: 6rem; /* Space for the sticky nav */
    width: 100%;
    display: grid;
    grid-template-areas: 'stack';
    justify-items: center;
    align-items: start;
    position: relative;
    min-height: 400px;
  }

  :global(body) {
    overflow-x: hidden;
  }

  .transition-wrapper {
    grid-area: stack;
    width: 100%;
    display: flex;
    justify-content: center;
    pointer-events: none;
    padding: 0 2rem;
    box-sizing: border-box;
  }

  .transition-wrapper > * {
    pointer-events: auto;
  }

  /* Ensure the incoming card is above the outgoing one */
  :global(.transition-wrapper:has(+ .transition-wrapper)) {
    z-index: 0;
  }
  :global(.transition-wrapper + .transition-wrapper) {
    z-index: 1;
  }

  nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: 1rem;
    padding: 1.5rem 2rem;
    flex-wrap: wrap;
    justify-content: center;
    z-index: 100;
    transition: all 0.3s ease;
  }

  nav.scrolled {
    background-color: var(--paper-white) !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
    padding: 1rem 2rem;
  }

  nav a {
    background: none;
    border: none;
    font-size: 1.5rem;
    font-family: inherit;
    cursor: pointer;
    color: var(--pen-blue);
    padding: 0.5rem 1rem;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    text-decoration: none;
  }

  nav a:hover {
    transform: scale(1.1);
  }

  nav a.active {
    border-bottom: 3px solid var(--pen-red);
    font-weight: bold;
    transform: rotate(-2deg);
  }

  .paper-sheet {
    background: linear-gradient(
      135deg,
      transparent 35.5px,
      var(--paper-white) 35.5px
    );
    position: relative;
    padding: 2.5rem;
    border-radius: 0.25rem;
    filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.2));
    width: 100%;
    max-width: 50rem;
    min-height: 400px;
    margin-bottom: 2rem; /* Margin below each card */
    box-sizing: border-box;
    transform: rotate(-2deg); /* Tilt applied specifically to the paper */
  }

  .paper-sheet::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 50px;
    background: linear-gradient(to bottom right, transparent 50%, #ffffff 50%);
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.15));
    pointer-events: none;
  }

  .room-form-wrapper {
    max-width: 25rem;
    margin: 0 auto;
    transform: rotate(
      -2deg
    ); /* Tilt applied specifically to the form wrapper */
  }

  .content {
    color: var(--pen-blue);
  }

  h2,
  h3 {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  a {
    color: var(--pen-red);
    text-decoration: underline;
  }

  /* Playtesting */
  .info-btn {
    background: var(--pen-blue);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.5rem;
    vertical-align: middle;
  }

  .info-tooltip {
    background: #fff;
    padding: 1rem;
    border: 1px solid var(--pen-blue);
    margin-bottom: 1rem;
    font-size: 0.9rem;
    border-radius: 4px;
  }

  .empty-message {
    font-style: italic;
    opacity: 0.8;
  }

  /* About */
  .about-sheet {
    padding-top: 3.5rem;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .team-member h3 {
    margin-top: 0.5rem;
  }

  .team-member.center {
    font-weight: bold;
  }

  .achievement,
  .b-roll {
    margin: 2rem 0;
    text-align: center;
  }

  img {
    max-width: 100%;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 0.5rem;
  }

  .achievement img {
    max-height: 400px;
  }

  /* Rules */
  .rounds-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .round-item {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 0.5rem;
    border: 1px dashed var(--pen-blue);
  }

  .round-item h3 {
    margin: 0 0 0.5rem 0;
    color: var(--pen-red);
  }

  .round-item p {
    margin: 0;
  }

  /* Credits */
  .credits-section {
    margin-bottom: 2rem;
  }

  .asset-list,
  .npm-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .asset-list li,
  .npm-list li {
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }

  .attribution {
    font-style: italic;
    color: #666;
    margin-left: 0.5rem;
  }

  .version {
    color: #888;
    font-size: 0.9em;
    margin-left: 0.5rem;
  }

  /* Keyframes for page transitions */
  @keyframes throwIn {
    0% {
      transform: translate(300px, -300px) rotate(10deg);
      opacity: 0;
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes fallOut {
    0% {
      transform: translateY(0);
      opacity: 1;
      filter: brightness(1);
    }
    50% {
      transform: translateY(0);
      opacity: 1;
      filter: brightness(0.8);
    }
    100% {
      transform: translateY(100px);
      opacity: 0;
      filter: brightness(0.8);
    }
  }

  /* Utility classes to apply the animations */
  /* Using :global ensures Svelte doesn't prune these as "unused" since they are added via JS */
  :global(.animate-throw-in) {
    animation: throwIn 0.8s cubic-bezier(0.33, 1, 0.68, 1) forwards;
  }

  :global(.animate-fall-out) {
    animation: fallOut 1.2s linear forwards;
  }

  @media (max-width: 768px) {
    /* Stabilize navbar size to prevent jumping animations */
    nav,
    nav.scrolled {
      padding: 1rem 1rem; /* Constant padding */
    }

    /* Increase content spacing to account for wrapped navbar */
    .content-viewport {
      margin-top: 10rem;
    }
  }
</style>
