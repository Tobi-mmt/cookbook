<script lang="ts" module>
	/** Solves a fresh challenge and returns the payload for the hidden `captcha` field */
	export const solveCaptcha = async () => {
		const [{ solveChallenge }, { deriveKey }] = await Promise.all([
			import('altcha-lib'),
			import('altcha-lib/algorithms/web/sha')
		]);
		const challenge = await (await fetch('/api/captcha')).json();
		const solution = await solveChallenge({ challenge, deriveKey });
		if (!solution) throw new Error('The captcha could not be solved');
		return btoa(JSON.stringify({ challenge, solution }));
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let { value = $bindable('') }: { value?: string } = $props();
	let failed = $state(false);

	onMount(() => {
		solveCaptcha()
			.then((payload) => (value = payload))
			.catch((error) => {
				console.error(error);
				failed = true;
			});
	});
</script>

<input type="hidden" name="captcha" {value} />
{#if failed}
	<p class="captcha-error" role="alert">
		Die Prüfung gegen Bots ist fehlgeschlagen. Bitte lade die Seite neu.
	</p>
{/if}

<style>
	.captcha-error {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
</style>
