<script lang="ts">
	import type { Category } from '#types';
	import { enhance } from '$app/forms';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: { categories: (Category & { recipes: number })[] };
		form: { saved?: string; error?: string } | null;
	} = $props();
</script>

<svelte:head>
	<title>Kategorien - {SITE_NAME}</title>
</svelte:head>

<h1>Kategorien</h1>
{#if form?.saved}<p class="message" role="status">{form.saved}</p>{/if}
{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}

<table class="table">
	<thead><tr><th>Name</th><th>Farbe</th><th>Position</th><th>Rezepte</th><th></th></tr></thead>
	<tbody>
		{#each data.categories as category (category.id)}
			<tr>
				<td colspan="3">
					<form method="POST" action="?/update" class="row" use:enhance>
						<input type="hidden" name="id" value={category.id} />
						<input class="input name" name="name" value={category.name} required />
						<input class="input color" type="color" name="color" value={category.color} />
						<input class="input position" type="number" name="position" value={category.position} />
						<button type="submit" class="btn">Speichern</button>
					</form>
				</td>
				<td>{category.recipes}</td>
				<td>
					<form method="POST" action="?/delete" class="row" use:enhance>
						<input type="hidden" name="id" value={category.id} />
						{#if category.recipes}
							<select class="input" name="replacement" aria-label="Ersatzkategorie">
								{#each data.categories.filter(({ id }) => id !== category.id) as other (other.id)}
									<option value={other.id}>{other.name}</option>
								{/each}
							</select>
						{/if}
						<button type="submit" class="btn btn--quiet btn--danger">Löschen</button>
					</form>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<h2>Neue Kategorie</h2>
<form method="POST" action="?/create" class="row" use:enhance>
	<input class="input name" name="name" placeholder="Name" required />
	<input class="input color" type="color" name="color" value="#888888" />
	<input
		class="input position"
		type="number"
		name="position"
		value={data.categories.length + 1}
		aria-label="Position"
	/>
	<button type="submit" class="btn btn--primary">Anlegen</button>
</form>

<style>
	h2 {
		margin: 2rem 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 700;
	}
	.name {
		flex: 1;
		min-width: 10rem;
	}
	.color {
		width: 3.5rem;
		padding: 0.2rem;
	}
	.position {
		width: 5rem;
	}
</style>
