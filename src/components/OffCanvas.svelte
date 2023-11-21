<script lang="ts">
	import Icon from './Icon.svelte';

	export let direction: 'left' | 'right' = 'left';
	export let headline: string;
	export let onClose: () => void;
	export let open: boolean;
</script>

<div class={`off-canvas off-canvas--from-${direction} off-canvas--${open ? 'open' : 'closed'}`}>
	<div class="header">
		<h2 class="headline">{headline}</h2>
		<div
			class="close-icon"
			role="button"
			aria-label="Schließen"
			on:click={onClose}
			on:keypress={onClose}
		>
			<Icon name="close" />
		</div>
	</div>
	<div class="content">
		<slot />
	</div>
</div>
<div
	class={`off-canvas__click-out off-canvas__click-out--${open ? 'open' : 'closed'}`}
	on:click={onClose}
	on:keypress={onClose}
/>

<style jsx>
	.off-canvas {
		width: 100%;
		height: 100vh;
		position: fixed;
		top: 0;
		right: 0;
		z-index: 200;
		transform: translateX(100%);
		transition: transform 0.2s ease-out;
		background-color: #fff;
		overflow-x: hidden;
	}
	.header {
		display: flex;
		justify-content: space-between;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 3.5em;
		padding: 1em 1em 1em 2em;
		z-index: 10;
	}
	.headline {
		margin: 0;
		line-height: 1em;
	}
	.content {
		height: calc(100vh - 3.5em);
		overflow-y: scroll;
		overflow-x: hidden;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
	}

	@media (min-width: 700px) {
		.off-canvas {
			max-width: 400px;
		}
	}

	.off-canvas--from-left {
		transform: translateX(-100%);
		right: unset;
		left: 0;
	}

	.off-canvas--open {
		transform: translateX(0);
	}

	.off-canvas__click-out {
		visibility: hidden;
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 199;
		background-color: #000;
		opacity: 0;
		cursor: pointer;
		transition:
			visibility 0s,
			opacity 0.2s ease-in-out;
	}
	.off-canvas__click-out--open {
		opacity: 0.25;
		visibility: visible;
	}

	.close-icon {
		cursor: pointer;
		font-size: 1.25em;
	}
	@media only screen and (max-width: 800px) {
		.header {
			padding-left: 1em;
		}
	}
</style>
