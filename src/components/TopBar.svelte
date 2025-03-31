<script lang="ts">
	import Icon from '$components/Icon.svelte';
	import OffCanvas from '$components/OffCanvas.svelte';
	import Menu from '$components/Menue.svelte';
	import Search from '$components/Search.svelte';

	let menuOpen = false;
	let isSearchOpen = false;
</script>

<div class="top-bar">
	<div
		tabindex="0"
		on:click={() => (menuOpen = true)}
		role="button"
		aria-label="Menü öffnen"
		on:keypress={() => (menuOpen = true)}
		class="action-icon"
	>
		<Icon name="navigation-menu" />
	</div>
	<a class="word-icon" href="/">
		<span class="word">Tobi's </span>
		<Icon style="font-size: 3em;" name="spoon-and-fork" />
		<span class="word"> Kochbuch</span>
	</a>

	<div
		tabindex="0"
		role="button"
		aria-label="Suche öffnen"
		on:click={() => (isSearchOpen = true)}
		on:keypress={() => (isSearchOpen = true)}
		class="action-icon"
	>
		<Icon name="search" />
	</div>
</div>

<Search bind:searchOpen={isSearchOpen} />
<OffCanvas headline="Menü" direction="left" open={menuOpen} onClose={() => (menuOpen = false)}>
	<Menu
		onItemClick={() => {
			menuOpen = false;
		}}
	/>
</OffCanvas>

<style>
	.top-bar {
		align-items: center;
		background: #fff;
		box-shadow: 0 0 15px #0003;
		display: flex;
		justify-content: space-between;
		padding: 0.5em 1.5em;
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.word-icon {
		display: flex;
		align-items: center;
		color: #333;
		text-decoration: none;
	}
	.word {
		margin: 0 0.5em;
	}
	.action-icon {
		font-size: 1.25em;
		cursor: pointer;
	}
</style>
