<script lang="ts">
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { enhance } from '$app/forms';

	let { form }: { form: { url?: string; error?: string } | null } = $props();

	let importing = $state(false);

	const submit: SubmitFunction = () => {
		importing = true;
		return async ({ update }) => {
			await update({ reset: false });
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
	/>
	<button type="submit" class="button button--primary" disabled={importing}>
		{importing ? 'Importiert…' : 'Importieren'}
	</button>
</form>
{#if form?.error}<p class="error">{form.error}</p>{/if}

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
</style>
