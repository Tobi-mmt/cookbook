<script lang="ts">
	import { enhance } from '$app/forms';
	import HiddenNotice from '#components/HiddenNotice.svelte';
	import Dialog from '#components/Dialog.svelte';
	import Copy from '@lucide/svelte/icons/copy';
	import { cookbookPath, profilePath } from '#lib/paths.js';
	import { SITE_NAME } from '#lib/site.js';
	import { page } from '$app/state';

	type Member = {
		userId: string;
		username: string | null;
		name: string;
		role: 'owner' | 'editor';
		joinedAt: Date;
	};

	let {
		data,
		form
	}: {
		data: {
			cookbook: { id: string; name: string; slug: string; hiddenReason: string | null };
			members: Member[];
			invitations: { id: string; email: string | null; createdAt: Date; expiresAt: Date }[];
			me: { id: string; isOwner: boolean };
			isLastCookbook: boolean;
			trash: { id: string; title: string; deletedAt: Date | null; deletedBy: string | null }[];
			stats: {
				perRecipe: { recipeId: string; title: string; visitors: number; views: number }[];
				days: { day: string; visitors: number }[];
			};
		};
		form: {
			error?: string;
			link?: string;
			sentTo?: string | null;
			restored?: string;
			emptied?: boolean;
		} | null;
	} = $props();

	const owner = $derived(data.members.find(({ role }) => role === 'owner'));
	const editors = $derived(data.members.filter(({ role }) => role === 'editor'));
	const cookbookHref = $derived(
		cookbookPath({ ownerUsername: owner?.username ?? '', slug: data.cookbook.slug })
	);
	let copied = $state(false);
	type Confirmation = {
		action: 'remove' | 'transfer' | 'leave' | 'delete' | 'deleteRecipes';
		title: string;
		text: string;
		label: string;
		fields?: Record<string, string>;
	};
	let confirming = $state<Confirmation | null>(null);
	const ask = (confirmation: Confirmation) => (confirming = confirmation);
	// svelte-ignore state_referenced_locally
	let transferTo = $state(data.members.find(({ role }) => role === 'editor')?.userId ?? '');

	const formatDate = (date: Date) =>
		new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(date);

	const copy = async (text: string) => {
		await navigator.clipboard.writeText(text);
		copied = true;
	};
</script>

<svelte:head>
	<title>Einstellungen von {data.cookbook.name} - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<p class="back"><a href={cookbookHref}>← {data.cookbook.name}</a></p>
	<h1>Einstellungen</h1>

	{#if data.cookbook.hiddenReason}
		<HiddenNotice type="cookbook" id={data.cookbook.id} reason={data.cookbook.hiddenReason} />
	{/if}
	{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}

	{#if data.me.isOwner}
		<h2>Name</h2>
		<form method="POST" action="?/rename" class="row" use:enhance>
			<input class="input name" name="name" value={data.cookbook.name} required maxlength="80" />
			<button type="submit" class="btn">Umbenennen</button>
		</form>
		<p class="hint">Die Adresse ändert sich mit, alte Links leiten weiter.</p>
	{/if}

	<h2>Wer bearbeiten darf</h2>
	<ul class="members">
		{#each data.members as member (member.userId)}
			<li>
				<span>
					{#if member.username}
						<a href={profilePath(member.username)}>{member.name}</a>
					{:else}
						{member.name}
					{/if}
					<span class="role">{member.role === 'owner' ? 'Besitzer' : 'Bearbeiter'}</span>
				</span>
				{#if data.me.isOwner && member.role === 'editor'}
					<button
						type="button"
						class="btn btn--quiet btn--danger"
						onclick={() =>
							ask({
								action: 'remove',
								title: `${member.name} entfernen?`,
								text: `${member.name} kann das Kochbuch dann nicht mehr bearbeiten. Rezepte von ${member.name} bleiben im Kochbuch.`,
								label: 'Entfernen',
								fields: { userId: member.userId }
							})}>Entfernen</button
					>
				{/if}
			</li>
		{/each}
	</ul>

	<h2>Person einladen</h2>
	<form method="POST" action="?/invite" class="stack" use:enhance>
		<p class="hint">
			Ein Einladungslink gilt 7 Tage und kann mehrfach benutzt werden, z. B. in einer
			WhatsApp-Gruppe. Du kannst ihn jederzeit widerrufen.
		</p>
		<div class="row">
			<input
				class="input email"
				type="email"
				name="email"
				placeholder="E-Mail-Adresse (optional)"
				aria-label="E-Mail-Adresse (optional)"
			/>
			<button type="submit" class="btn btn--primary">Einladungslink erstellen</button>
		</div>
	</form>
	{#if form?.link}
		<div class="message link">
			{#if form.sentTo}<p>Die Einladung ist per Mail an {form.sentTo} unterwegs.</p>{/if}
			<code>{form.link}</code>
			<button type="button" class="btn" onclick={() => copy(form!.link!)}>
				<Copy size="1em" aria-hidden="true" />
				{copied ? 'Kopiert' : 'Link kopieren'}
			</button>
		</div>
	{/if}
	{#if data.invitations.length}
		<ul class="members">
			{#each data.invitations as invitation (invitation.id)}
				<li>
					<span>
						Offene Einladung{invitation.email ? ` an ${invitation.email}` : ''}
						<span class="role">bis {formatDate(invitation.expiresAt)}</span>
					</span>
					<form method="POST" action="?/revoke" use:enhance>
						<input type="hidden" name="id" value={invitation.id} />
						<button type="submit" class="btn btn--quiet btn--danger">Widerrufen</button>
					</form>
				</li>
			{/each}
		</ul>
	{/if}

	{#if data.me.isOwner && editors.length}
		<h2>Kochbuch übergeben</h2>
		<div class="row">
			<select class="input name" bind:value={transferTo} aria-label="Neuer Besitzer">
				{#each editors as editor (editor.userId)}
					<option value={editor.userId}>{editor.name}</option>
				{/each}
			</select>
			<button
				type="button"
				class="btn"
				onclick={() => {
					const editor = editors.find(({ userId }) => userId === transferTo) ?? editors[0];
					ask({
						action: 'transfer',
						title: `An ${editor.name} übergeben?`,
						text: `${editor.name} wird Besitzer von „${data.cookbook.name}“ und kann danach Bearbeiter entfernen, das Kochbuch umbenennen oder löschen. Du bleibst Bearbeiter. Die Adresse ändert sich, die alte leitet weiter.`,
						label: 'Übergeben',
						fields: { userId: editor.userId }
					});
				}}>Übergeben</button
			>
		</div>
		<p class="hint">
			Das Kochbuch zieht unter den Namen der neuen Besitzerin oder des Besitzers um.
		</p>
	{/if}

	<h2>Statistik</h2>
	{#if data.stats.perRecipe.length}
		{@const max = Math.max(1, ...data.stats.days.map(({ visitors }) => visitors))}
		<div class="chart" role="img" aria-label="Besucher pro Tag der letzten 30 Tage">
			{#each data.stats.days as day (day.day)}
				<span style="height: {(day.visitors / max) * 100}%" title="{day.day}: {day.visitors}"
				></span>
			{/each}
		</div>
		<table class="stats">
			<thead>
				<tr><th>Rezept</th><th>Besucher</th><th>Aufrufe</th></tr>
			</thead>
			<tbody>
				{#each data.stats.perRecipe as row (row.recipeId)}
					<tr><td>{row.title}</td><td>{row.visitors}</td><td>{row.views}</td></tr>
				{/each}
			</tbody>
		</table>
		<p class="hint">
			Die letzten 30 Tage, ohne Cookies gezählt: Wer an mehreren Tagen kommt, zählt mehrfach. Bis
			gestern, die Zahlen werden nachts aktualisiert.
		</p>
	{:else}
		<p class="hint">In den letzten 30 Tagen wurden noch keine Aufrufe gezählt.</p>
	{/if}

	<h2>Papierkorb</h2>
	{#if form?.restored}<p class="message" role="status">„{form.restored}“ ist wieder da.</p>{/if}
	{#if data.trash.length}
		<ul class="members">
			{#each data.trash as recipe (recipe.id)}
				<li>
					<span>
						{recipe.title}
						<span class="role"
							>gelöscht{recipe.deletedBy ? ` von ${recipe.deletedBy}` : ''}{recipe.deletedAt
								? ` am ${formatDate(recipe.deletedAt)}`
								: ''}</span
						>
					</span>
					<form method="POST" action="?/restore" use:enhance>
						<input type="hidden" name="id" value={recipe.id} />
						<button type="submit" class="btn btn--quiet">Wiederherstellen</button>
					</form>
				</li>
			{/each}
		</ul>
		<p class="hint">Gelöschte Rezepte werden nach 30 Tagen endgültig entfernt.</p>
	{:else}
		<p class="hint">Der Papierkorb ist leer.</p>
	{/if}

	<h2>Verlassen oder löschen</h2>
	{#if !data.me.isOwner}
		<button
			type="button"
			class="btn btn--danger"
			onclick={() =>
				ask({
					action: 'leave',
					title: `„${data.cookbook.name}“ verlassen?`,
					text: 'Du kannst das Kochbuch dann nicht mehr bearbeiten. Deine Rezepte bleiben im Kochbuch, weil sie dem Kochbuch gehören.',
					label: 'Verlassen'
				})}>Kochbuch verlassen</button
		>
	{:else if data.isLastCookbook}
		<button
			type="button"
			class="btn btn--danger"
			onclick={() =>
				ask({
					action: 'deleteRecipes',
					title: 'Alle Rezepte löschen?',
					text: 'Dein letztes Kochbuch bleibt bestehen, alle Rezepte darin kommen für 30 Tage in den Papierkorb. Kopien, die andere übernommen haben, bleiben bestehen.',
					label: 'Alle Rezepte löschen'
				})}>Alle Rezepte löschen</button
		>
	{:else}
		<button
			type="button"
			class="btn btn--danger"
			onclick={() =>
				ask({
					action: 'delete',
					title: `„${data.cookbook.name}“ löschen?`,
					text: 'Das Kochbuch und alle Rezepte darin kommen für 30 Tage in den Papierkorb. Kopien, die andere übernommen haben, bleiben bestehen.',
					label: 'Kochbuch löschen'
				})}>Kochbuch löschen</button
		>
	{/if}

	<Dialog
		open={Boolean(confirming)}
		title={confirming?.title ?? ''}
		onclose={() => (confirming = null)}
	>
		<p>{confirming?.text}</p>
		<form
			id="confirm-action"
			method="POST"
			action="?/{confirming?.action}"
			use:enhance={() =>
				async ({ update }) => {
					confirming = null;
					await update();
				}}
		>
			{#each Object.entries(confirming?.fields ?? {}) as [name, value] (name)}
				<input type="hidden" {name} {value} />
			{/each}
		</form>
		{#snippet actions()}
			<button type="button" class="btn btn--quiet" onclick={() => (confirming = null)}
				>Abbrechen</button
			>
			<button type="submit" class="btn btn--danger" form="confirm-action"
				>{confirming?.label}</button
			>
		{/snippet}
	</Dialog>
	<p class="hint address">Adresse: {page.url.host}/@{owner?.username}/{data.cookbook.slug}</p>
</div>

<style>
	.back {
		margin: 0 0 1rem;
		font-size: 0.875rem;
	}
	.back a {
		color: var(--color-text-muted);
		text-decoration: none;
	}
	.members {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--color-border);
	}
	.members li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-height: 3rem;
		border-bottom: 1px solid var(--color-border);
	}
	.members a {
		color: var(--color-text);
	}
	.role {
		margin-left: 0.5rem;
		font-size: 0.8125rem;
		color: var(--color-text-subtle);
	}
	.name,
	.email {
		flex: 1;
		min-width: 12rem;
	}
	.hint {
		margin-top: 0.5rem;
	}
	.link {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		margin-top: 1rem;
	}
	.link p {
		margin: 0;
	}
	.link code {
		overflow-wrap: anywhere;
	}
	.chart {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		height: 4rem;
		margin-bottom: 1rem;
	}
	.chart span {
		flex: 1;
		min-height: 1px;
		background: var(--color-text-subtle);
		border-radius: 1px;
	}
	.stats {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9375rem;
	}
	.stats th,
	.stats td {
		padding: 0.4rem 0.25rem;
		text-align: right;
		border-bottom: 1px solid var(--color-border);
	}
	.stats th:first-child,
	.stats td:first-child {
		text-align: left;
	}
	.stats th {
		font-weight: 400;
		color: var(--color-text-subtle);
	}
	.address {
		margin-top: 3rem;
	}
</style>
