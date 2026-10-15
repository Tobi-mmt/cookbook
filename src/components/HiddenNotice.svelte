<script lang="ts">
	let { type, id, reason }: { type: 'recipe' | 'cookbook'; id: string; reason: string } = $props();
	let state = $state<'idle' | 'sent' | 'failed'>('idle');

	const requestReview = async () => {
		const response = await fetch('/api/moderation/erneut', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ type, id })
		});
		state = response.ok && (await response.json()).reopened ? 'sent' : 'failed';
	};
</script>

<div class="message message--error stack">
	<p>Von der Moderation ausgeblendet: {reason}</p>
	{#if state === 'sent'}
		<p>Danke, die Moderation schaut es sich noch einmal an.</p>
	{:else}
		<p class="hint">
			Andere sehen {type === 'recipe' ? 'das Rezept' : 'das Kochbuch'} nicht mehr. Korrigiere es und lass
			es danach erneut prüfen.
		</p>
		<div class="row">
			<button type="button" class="btn" onclick={requestReview}>Erneut prüfen lassen</button>
		</div>
		{#if state === 'failed'}<p>
				Das hat nicht geklappt, antworte bitte auf die Mail der Moderation.
			</p>{/if}
	{/if}
</div>

<style>
	p {
		margin: 0;
	}
</style>
