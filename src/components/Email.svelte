<script lang="ts">
	import { onMount } from 'svelte';
	import { SITE_DOMAIN, SUPPORT_MAILBOX } from '#lib/site.js';

	let address = $state<string | null>(null);

	onMount(() => {
		address = [SUPPORT_MAILBOX, SITE_DOMAIN].join(String.fromCharCode(64));
	});
</script>

{#if address}
	<a href="mailto:{address}">{address}</a>
{:else}
	<span>{SUPPORT_MAILBOX} (at) {SITE_DOMAIN.replace('.', ' (punkt) ')}</span>
{/if}

<style>
	a {
		color: inherit;
	}
</style>
