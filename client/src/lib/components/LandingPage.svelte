<script lang="ts">
  import RoomForm from './RoomForm.svelte';
  import { Rounds } from '@shared/rounds';
  import { currentSubRoute, navigateToPath } from '../Navigator';

  let showPlaytestInfo = $state(false);
  let isScrolled = $state(false);

  function togglePlaytestInfo() {
    showPlaytestInfo = !showPlaytestInfo;
  }

  function handleNav(e: MouseEvent, path: string) {
    e.preventDefault();
    navigateToPath(path);
  }

  $effect(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 20;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  $effect(() => {
    // Scroll to top whenever the subroute changes
    if ($currentSubRoute) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  });
</script>

<div class="landing-container">
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
  </nav>

  {#if $currentSubRoute === 'play'}
    <div class="room-form-wrapper">
      <RoomForm />
    </div>
  {:else if $currentSubRoute === 'playtesting'}
    <div class="paper-sheet">
      <div class="content playtesting">
        <h2>Next Playtest: TBD</h2>
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
            Alpha is an early stage of development where the whole game isn't
            finished and just core mechanics are being tested.
          </div>
        {/if}

        <div class="playtesters-list">
          <p class="empty-message">
            Thank you to everyone who has playtested so far, we'll compile your
            names here at a later date. You guys are integral to making this
            game fun and deserve credit for it :D
          </p>
        </div>
      </div>
    </div>
  {:else if $currentSubRoute === 'about'}
    <div class="paper-sheet">
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
            <img src="/images/about/demo.jpeg" alt="Jasmine demoing the game" />
          </div>

          <div class="origin-story">
            <p>
              This game started as a physical card game in Jasmine's "Intro to
              Game Design" class at UC.
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
  {/if}
</div>

<style>
  .landing-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 6rem); /* Adjust for padding-top */
    padding: 0 2rem 2rem 2rem;
    padding-top: 6rem; /* Space for the sticky nav */
    box-sizing: border-box;
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
    background-color: var(--paper-white);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
    background-color: var(--paper-white);
    padding: 2.5rem;
    border-radius: 0.25rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    transform: rotate(-2deg);
    width: 100%;
    max-width: 50rem;
    min-height: 400px;
    box-sizing: border-box;
  }

  .room-form-wrapper {
    max-width: 25rem;
    margin: 0 auto;
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
</style>
