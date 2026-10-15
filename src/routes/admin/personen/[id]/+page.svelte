<script lang="ts">
	import { enhance } from '$app/forms';
	import Dialog from '#components/Dialog.svelte';
	import { resolve } from '$app/paths';
	import { cookbookPath } from '#lib/paths.js';
	import type { EditableCookbook } from '#lib/server/cookbooks.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: {
			person: {
				id: string;
				name: string;
				username: string | null;
				email: string;
				role: string;
				banned: boolean;
				banReason: string | null;
				unreliableReporter: boolean;
				storageLimitMb: number;
				createdAt: Date;
			};
			cookbooks: EditableCookbook[];
			storageUsedMb: number;
			reportsBy: number;
			casesAgainst: { id: number; status: string; decision: string | null }[];
		};
		form: { saved?: string; error?: string } | null;
	} = $props();

	const person = $derived(data.person);
	let confirmDelete = $state(false);
</script>

<svelte:head>
	<title>{person.name} - {SITE_NAME}</title>
</svelte:head>

<p><a href={resolve('/admin/personen')}>← Personen</a></p>
<h1>{person.name}</h1>
{#if form?.saved}<p class="message" role="status">{form.saved}</p>{/if}
{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}
{#if person.banned}<p class="message message--error">Gesperrt: {person.banReason}</p>{/if}

<p class="hint">
	Seit {person.createdAt.toLocaleDateString('de-DE')} · {data.storageUsedMb} MB Bilder ·
	{data.reportsBy} eigene Meldungen
	{#if person.username}· <a href="/@{person.username}" target="_blank">Profil</a>{/if}
</p>

<form method="POST" action="?/save" class="stack" use:enhance>
	<div class="grid">
		<label class="field"
			>Name <input class="input" name="name" value={person.name} required /></label
		>
		<label class="field">
			Benutzername <input class="input" name="username" value={person.username ?? ''} required />
		</label>
		<label class="field">
			E-Mail <input class="input" type="email" name="email" value={person.email} required />
		</label>
		<label class="field">
			Rolle
			<select class="input" name="role" value={person.role}>
				<option value="user">Person</option>
				<option value="admin">Admin</option>
			</select>
		</label>
		<label class="field">
			Speicher für Bilder (MB)
			<input
				class="input"
				type="number"
				min="0"
				name="storageLimitMb"
				value={person.storageLimitMb}
			/>
		</label>
	</div>
	<label class="checkbox">
		<input type="checkbox" name="unreliableReporter" checked={person.unreliableReporter} />
		Meldungen dieser Person sind unzuverlässig
	</label>
	<div class="row"><button type="submit" class="btn btn--primary">Speichern</button></div>
</form>

<h2>Kochbücher</h2>
<ul>
	{#each data.cookbooks as cookbook (cookbook.id)}
		<li>
			<a href={cookbookPath(cookbook)} target="_blank">{cookbook.name}</a>
			({cookbook.role === 'owner' ? 'Besitzer' : 'Bearbeiter'})
		</li>
	{/each}
</ul>

{#if data.casesAgainst.length}
	<h2>Fälle zu dieser Person</h2>
	<ul>
		{#each data.casesAgainst as item (item.id)}
			<li>
				<a href={resolve('/admin/meldungen/[id]', { id: String(item.id) })}>Fall {item.id}</a>:
				{item.decision ?? item.status}
			</li>
		{/each}
	</ul>
{/if}

<h2>Maßnahmen</h2>
<form method="POST" class="stack" use:enhance>
	<label class="field">
		Grund, geht per Mail an die Person
		<textarea class="input" name="reason"></textarea>
	</label>
	<div class="row">
		<button type="submit" class="btn" formaction="?/warn">Verwarnen</button>
		{#if person.banned}
			<button type="submit" class="btn" formaction="?/unban">Entsperren</button>
		{:else}
			<button type="submit" class="btn btn--danger" formaction="?/ban">Sperren</button>
		{/if}
		<button type="submit" class="btn" formaction="?/signOut">Überall abmelden</button>
	</div>
</form>

<h2>Löschen</h2>
<button type="button" class="btn btn--danger" onclick={() => (confirmDelete = true)}
	>Konto löschen</button
>
<Dialog bind:open={confirmDelete} title="Konto von {person.name} löschen?">
	<p>
		Das Konto wird sofort gelöscht, mit allen Kochbüchern ohne andere Bearbeiter. Gemeinsame
		Kochbücher werden übergeben.
	</p>
	<form id="delete-person" method="POST" action="?/delete" use:enhance></form>
	{#snippet actions()}
		<button type="button" class="btn btn--quiet" onclick={() => (confirmDelete = false)}
			>Abbrechen</button
		>
		<button type="submit" class="btn btn--danger" form="delete-person">Endgültig löschen</button>
	{/snippet}
</Dialog>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 1rem;
	}
	h2 {
		margin: 2rem 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 700;
	}
	a {
		color: var(--color-text);
	}
</style>
