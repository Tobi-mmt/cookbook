<script lang="ts">
	import Icon from './Icon.svelte';
	import OffCanvas from './OffCanvas.svelte';
	import Menu from './Menue.svelte';
	import Search from './Search.svelte';

	let menuOpen = false;
	let isSearchOpen = false;
</script>

<div class="top-bar">
	<div on:click={() => (menuOpen = true)} class="action-icon"><Icon name="navigation-menu" /></div>
	<div class="word-icon">
		<span class="word">Tobi's </span>
		<Icon style="font-size: 3em;" name="spoon-and-fork" />
		<span class="word"> Kochbuch</span>
	</div>
	<div on:click={() => (isSearchOpen = true)} class="action-icon"><Icon name="search" /></div>
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
		box-shadow: 0 0 25px #0005;
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
	}
	.word {
		margin: 0 0.5em;
	}
	.action-icon {
		font-size: 1.25em;
		cursor: pointer;
	}
</style>
