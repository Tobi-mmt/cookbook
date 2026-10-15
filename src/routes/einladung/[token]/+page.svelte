<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data
	}: {
		data: {
			usable: boolean;
			signedIn: boolean;
			cookbook: { name: string; ownerUsername: string };
		};
	} = $props();
</script>

<svelte:head>
	<title>Einladung - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page page--narrow">
	<h1>Einladung</h1>
	{#if !data.usable}
		<p class="message">
			Diese Einladung ist abgelaufen oder wurde widerrufen. Bitte um einen neuen Link.
		</p>
	{:else}
		<div class="stack">
			<p>„{data.cookbook.name}“ von @{data.cookbook.ownerUsername} beitreten?</p>
			<p class="hint">
				Danach kannst du alle Rezepte in diesem Kochbuch bearbeiten und neue hinzufügen.
			</p>
			{#if data.signedIn}
				<form method="POST" use:enhance>
					<button type="submit" class="btn btn--primary btn--block">Beitreten</button>
				</form>
			{:else}
				<a
					class="btn btn--primary btn--block"
					href="{resolve('/anmelden')}?weiter={encodeURIComponent(page.url.pathname)}"
					>Anmelden oder registrieren</a
				>
			{/if}
		</div>
	{/if}
</div>
