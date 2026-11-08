<script lang="ts">
	import PasskeyPrompt from '#components/PasskeyPrompt.svelte';
	import { SITE_NAME } from '#lib/site.js';

	let { data }: { data: { next: string; hasPasskeys: boolean; remember: boolean } } = $props();
</script>

<svelte:head>
	<title>Passkey anlegen - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page page--narrow">
	<PasskeyPrompt {...data} />
</div>
