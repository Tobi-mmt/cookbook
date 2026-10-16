<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: {
			cookbook: {
				id: string;
				name: string;
				slug: string;
				hiddenAt: Date | null;
				hiddenReason: string | null;
				deletedAt: Date | null;
			};
			members: {
				userId: string;
				username: string | null;
				name: string;
				role: 'owner' | 'editor';
			}[];
			invitations: { id: string; email: string | null; expiresAt: Date }[];
		};
		form: { saved?: string; error?: string } | null;
	} = $props();

	const cookbook = $derived(data.cookbook);
	const owner = $derived(data.members.find(({ role }) => role === 'owner'));
	const editors = $derived(data.members.filter(({ role }) => role === 'editor'));
</script>

<svelte:head>
	<title>{cookbook.name} - {SITE_NAME}</title>
</svelte:head>

<p><a href={resolve('/admin/kochbuecher')}>← Kochbücher</a></p>
<h1>{cookbook.name}</h1>
{#if form?.saved}<p class="message" role="status">{form.saved}</p>{/if}
{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}
{#if cookbook.deletedAt}<p class="message message--error">Im Papierkorb</p>{/if}
{#if cookbook.hiddenAt}<p class="message message--error">
		Ausgeblendet: {cookbook.hiddenReason}
	</p>{/if}
<p class="hint">
	<a href="/@{owner?.username}/{cookbook.slug}" target="_blank"
		>/@{owner?.username}/{cookbook.slug}</a
	>
</p>

<h2>Name und Adresse</h2>
<form method="POST" action="?/rename" class="row" use:enhance>
	<input class="input" name="name" value={cookbook.name} required />
	<button type="submit" class="btn">Umbenennen</button>
</form>

<h2>Bearbeiter</h2>
<div class="table-scroll">
	<table class="table">
		<tbody>
			{#each data.members as member (member.userId)}
				<tr>
					<td>
						<a href={resolve('/admin/personen/[id]', { id: member.userId })}>{member.name}</a>
						{member.username ? `@${member.username}` : ''}
					</td>
					<td>{member.role === 'owner' ? 'Besitzer' : 'Bearbeiter'}</td>
					<td>
						{#if member.role === 'editor'}
							<form method="POST" action="?/removeEditor" use:enhance>
								<input type="hidden" name="userId" value={member.userId} />
								<button type="submit" class="btn btn--quiet btn--danger">Entfernen</button>
							</form>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<form method="POST" action="?/addEditor" class="row add" use:enhance>
	<input class="input" name="username" placeholder="@benutzername" required />
	<button type="submit" class="btn">Hinzufügen</button>
</form>
{#if editors.length}
	<form method="POST" action="?/transfer" class="row add" use:enhance>
		<select class="input" name="userId" aria-label="Neuer Besitzer">
			{#each editors as editor (editor.userId)}<option value={editor.userId}>{editor.name}</option
				>{/each}
		</select>
		<button type="submit" class="btn">Besitz übertragen</button>
	</form>
{/if}

{#if data.invitations.length}
	<h2>Offene Einladungen</h2>
	<ul>
		{#each data.invitations as invitation (invitation.id)}
			<li>
				{invitation.email ?? 'Link'} bis {invitation.expiresAt.toLocaleDateString('de-DE')}
				<form method="POST" action="?/revoke" class="inline" use:enhance>
					<input type="hidden" name="id" value={invitation.id} />
					<button type="submit" class="btn btn--quiet">Widerrufen</button>
				</form>
			</li>
		{/each}
	</ul>
{/if}

<h2>Sichtbarkeit</h2>
<form method="POST" class="stack" use:enhance>
	{#if cookbook.hiddenAt}
		<div class="row">
			<button type="submit" class="btn" formaction="?/unhide">Wieder einblenden</button>
		</div>
	{:else}
		<label class="field">Grund <input class="input" name="reason" /></label>
		<div class="row"><button type="submit" class="btn" formaction="?/hide">Ausblenden</button></div>
	{/if}
	<div class="row">
		{#if cookbook.deletedAt}
			<button type="submit" class="btn" formaction="?/restore">Wiederherstellen</button>
		{:else}
			<button type="submit" class="btn btn--danger" formaction="?/delete">Löschen</button>
		{/if}
	</div>
</form>

<style>
	h2 {
		margin: 2rem 0 0.75rem;
		font-size: 1.125rem;
		font-weight: 700;
	}
	.add {
		margin-top: 0.75rem;
	}
	.inline {
		display: inline;
	}
	a {
		color: var(--color-text);
	}
</style>
