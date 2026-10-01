<script lang="ts">
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { enhance } from '$app/forms';

	let { form }: { form: { url?: string; error?: string } | null } = $props();

	let importing = $state(false);
	let requestError = $state<string | null>(null);

	const error = $derived(requestError ?? form?.error);

	const submit: SubmitFunction = () => {
		importing = true;
		requestError = null;
		return async ({ result, update }) => {
			if (result.type === 'error') {
				console.error(result.error);
				requestError =
					'Der Import ist fehlgeschlagen oder hat zu lange gedauert. Bitte später erneut versuchen.';
			} else {
				await update({ reset: false });
			}
			importing = false;
		};
	};
</script>

<svelte:head>
	<title>Rezept importieren - Unser Kochbuch</title>
</svelte:head>

<h1>Rezept importieren</h1>
<p class="hint">
	Funktioniert mit allen Seiten, die Rezepte nach dem schema.org-Standard auszeichnen, z.B. Chefkoch
	oder lecker.de. Das Rezept wird gespeichert, aber erst nach dem Speichern im Editor
	veröffentlicht.
</p>

<form method="POST" use:enhance={submit} class="import">
	<input
		type="url"
		name="url"
		value={form?.url ?? ''}
		placeholder="https://www.chefkoch.de/rezepte/…"
		required
		readonly={importing}
	/>
	<button type="submit" class="button button--primary" disabled={importing}>
		{importing ? 'Importiert…' : 'Importieren'}
	</button>
</form>
{#if importing}
	<p class="progress" role="status">
		<span class="spinner" aria-hidden="true"></span>
		Rezept und Bild werden geladen und verarbeitet. Das kann bis zu einer Minute dauern.
	</p>
{:else if error}
	<p class="import-error" role="alert">{error}</p>
{/if}

<a href={resolve('/admin', {})} class="button">Abbrechen</a>

<style>
	h1 {
		font-weight: 200;
	}
	.hint {
		color: #777;
	}
	.import {
		display: flex;
		gap: 0.5em;
		margin: 1.5em 0;
	}
	.import input {
		flex: 1;
	}
	.progress,
	.import-error {
		display: flex;
		align-items: center;
		gap: 0.75em;
		border-radius: 4px;
		padding: 0.75em 1em;
	}
	.progress {
		background: #f3f3f6;
		border: 1px solid #d6d4e3;
	}
	.import-error {
		color: #b3261e;
		background: #fdecea;
		border: 1px solid #e3a7a3;
	}
	.spinner {
		flex: none;
		width: 1.2em;
		height: 1.2em;
		border: 2px solid #d6d4e3;
		border-top-color: #27343a;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
