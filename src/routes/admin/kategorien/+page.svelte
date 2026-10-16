<script lang="ts">
	import type { Category } from '#types';
	import { enhance } from '$app/forms';
	import Dialog from '#components/Dialog.svelte';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: { categories: (Category & { recipes: number })[] };
		form: { saved?: string; error?: string } | null;
	} = $props();

	let confirmDelete = $state<number | null>(null);
</script>

<svelte:head>
	<title>Kategorien - {SITE_NAME}</title>
</svelte:head>

<h1>Kategorien</h1>
{#if form?.saved}<p class="message" role="status">{form.saved}</p>{/if}
{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}

<div class="table-scroll">
	<table class="table">
		<thead>
			<tr><th>Name</th><th>Farbe</th><th>Position</th><th>Rezepte</th><th></th></tr>
		</thead>
		<tbody>
			{#each data.categories as category (category.id)}
				{@const formId = `category-${category.id}`}
				<tr>
					<!-- the inputs of a row belong to the form in its last cell -->
					<td
						><input
							class="input name"
							name="name"
							value={category.name}
							form={formId}
							required
						/></td
					>
					<td>
						<input
							class="input color"
							type="color"
							name="color"
							value={category.color}
							form={formId}
							aria-label="Farbe von {category.name}"
						/>
					</td>
					<td>
						<input
							class="input position"
							type="number"
							name="position"
							value={category.position}
							form={formId}
							aria-label="Position von {category.name}"
						/>
					</td>
					<td>{category.recipes}</td>
					<td>
						<div class="row">
							<form id={formId} method="POST" action="?/update" use:enhance>
								<input type="hidden" name="id" value={category.id} />
								<button type="submit" class="btn">Speichern</button>
							</form>
							<button
								type="button"
								class="btn btn--quiet btn--danger"
								aria-expanded={confirmDelete === category.id}
								onclick={() => (confirmDelete = category.id)}>Löschen</button
							>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#each data.categories as category (category.id)}
	{@const formId = `delete-category-${category.id}`}
	<Dialog
		open={confirmDelete === category.id}
		title="„{category.name}“ löschen?"
		onclose={() => (confirmDelete = null)}
	>
		<form
			id={formId}
			method="POST"
			action="?/delete"
			use:enhance={() =>
				async ({ update }) => {
					confirmDelete = null;
					await update();
				}}
		>
			<input type="hidden" name="id" value={category.id} />
			{#if category.recipes}
				<label class="field">
					{category.recipes === 1
						? '1 Rezept verwendet diese Kategorie. Es wird verschoben nach:'
						: `${category.recipes} Rezepte verwenden diese Kategorie. Sie werden verschoben nach:`}
					<select class="input" name="replacement" required>
						{#each data.categories.filter(({ id }) => id !== category.id) as other (other.id)}
							<option value={other.id}>{other.name}</option>
						{/each}
					</select>
				</label>
			{:else}
				<p>Kein Rezept verwendet diese Kategorie.</p>
			{/if}
		</form>
		{#snippet actions()}
			<button type="button" class="btn btn--quiet" onclick={() => (confirmDelete = null)}
				>Abbrechen</button
			>
			<button type="submit" class="btn btn--danger" form={formId}>Löschen</button>
		{/snippet}
	</Dialog>
{/each}

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
		width: 100%;
		min-width: 10rem;
	}
	td {
		vertical-align: middle;
	}
	.color {
		width: 3.5rem;
		padding: 0.2rem;
	}
	.position {
		width: 5rem;
	}
</style>
