<script lang="ts">
	import { goto } from '$app/navigation';
	import Dialog from '#components/Dialog.svelte';
	import { me } from '#lib/me.svelte.js';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let name = $state('');
	let error = $state<string | null>(null);

	const create = async (event: SubmitEvent) => {
		event.preventDefault();
		error = null;
		const response = await fetch('/api/kochbuch', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name })
		});
		const body = await response.json().catch(() => null);
		if (!response.ok) {
			error = body?.message ?? 'Das Kochbuch konnte nicht angelegt werden.';
			return;
		}
		open = false;
		name = '';
		await me.refresh();
		await goto(body.path);
	};
</script>

<Dialog bind:open title="Neues Kochbuch">
	<form id="new-cookbook" onsubmit={create}>
		<label class="field">
			Name
			<!-- svelte-ignore a11y_autofocus -->
			<input
				class="input"
				bind:value={name}
				placeholder="z. B. Grillen oder Weihnachten"
				maxlength="80"
				required
				autofocus
			/>
		</label>
		{#if error}<p class="message message--error" role="alert">{error}</p>{/if}
	</form>
	<p class="hint">Danach kannst du das Kochbuch mit anderen teilen.</p>
	{#snippet actions()}
		<button type="button" class="btn btn--quiet" onclick={() => (open = false)}>Abbrechen</button>
		<button type="submit" class="btn btn--primary" form="new-cookbook" disabled={!name.trim()}
			>Anlegen</button
		>
	{/snippet}
</Dialog>
