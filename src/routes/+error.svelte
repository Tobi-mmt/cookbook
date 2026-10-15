<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { SITE_NAME } from '#lib/site.js';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Nicht gefunden' : 'Fehler'} - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page page--narrow">
	{#if page.status === 404}
		<h1>Nicht gefunden</h1>
		<p>Diese Seite gibt es nicht oder nicht mehr.</p>
	{:else}
		<h1>Etwas ist schiefgegangen</h1>
		<p>Bitte versuche es gleich noch einmal.</p>
	{/if}
	<p><a class="btn" href={resolve('/')}>Zur Startseite</a></p>
</div>
