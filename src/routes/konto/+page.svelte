<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Dialog from '#components/Dialog.svelte';
	import { cookbookPath } from '#lib/paths.js';
	import { daysUntil, inDays } from '#lib/daysUntil.js';
	import type { EditableCookbook } from '#lib/server/cookbooks.js';
	import { SITE_NAME } from '#lib/site.js';
	import { createPasskey, deviceName, renamePasskey } from '#lib/passkeys.js';

	let {
		data,
		form
	}: {
		data: {
			account: { name: string; username: string; email: string; deletionAt: Date | null };
			cookbooks: EditableCookbook[];
			deletionDays: number;
			deletedCookbooks: { id: string; name: string; deletedAt: Date | null }[];
			storage: { used: number; limit: number; full: boolean };
			bounced: boolean;
		};
		form: { saved?: string; error?: string } | null;
	} = $props();

	type Passkey = { id: string; name?: string | null; createdAt: Date };
	let passkeys = $state<Passkey[] | null>(null);
	let passkeyError = $state<string | null>(null);
	let confirmDeletion = $state(false);
	let editingEmail = $state(false);

	const megabytes = (bytes: number) =>
		`${(bytes / 1024 / 1024).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB`;
	const share = $derived(Math.min(1, data.storage.used / data.storage.limit));
	const formatDate = (date: Date) =>
		new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(new Date(date));

	const loadPasskeys = async () => {
		const { authClient } = await import('#lib/authClient.js');
		const { data: list } = await authClient.passkey.listUserPasskeys();
		passkeys = (list ?? []) as Passkey[];
	};
	onMount(loadPasskeys);

	/** one dialog for naming a new passkey and for renaming one */
	let naming = $state<{ id: string | null; name: string } | null>(null);

	const savePasskeyName = async () => {
		if (!naming) return;
		passkeyError = null;
		const { id, name } = naming;
		naming = null;
		const saved = id ? await renamePasskey(id, name) : await createPasskey(name);
		if (!saved) {
			passkeyError = id ? 'Der Name wurde nicht gespeichert.' : 'Der Passkey wurde nicht angelegt.';
		}
		await loadPasskeys();
	};

	const removePasskey = async (id: string) => {
		const { authClient } = await import('#lib/authClient.js');
		await authClient.passkey.deletePasskey({ id });
		await loadPasskeys();
	};
</script>

<svelte:head>
	<title>Konto - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<h1>Konto</h1>

	{#if data.account.deletionAt}
		<form method="POST" action="?/cancelDeletion" class="deletion stack" use:enhance>
			<p class="deletion-title">
				Dein Konto wird {inDays(daysUntil(data.account.deletionAt))} gelöscht.
			</p>
			<p>
				Am {formatDate(data.account.deletionAt)} löschen wir dein Konto und alle Kochbücher, die nur du
				bearbeitest. Bis dahin kannst du es dir anders überlegen.
			</p>
			<div class="row">
				<button type="submit" class="btn btn--primary">Löschen abbrechen</button>
				<a class="btn" href={resolve('/konto/export')} data-sveltekit-reload>Daten herunterladen</a>
			</div>
		</form>
	{/if}
	{#if data.bounced}
		<p class="message message--error">
			Bitte prüfe deine E-Mail-Adresse: Mails an sie kommen nicht an.
		</p>
	{/if}
	{#if page.url.searchParams.has('email')}
		<p class="message" role="status">Deine neue E-Mail-Adresse ist bestätigt.</p>
	{/if}
	{#if form?.saved}<p class="message" role="status">{form.saved}</p>{/if}
	{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}

	<h2>Profil</h2>
	<form method="POST" action="?/profile" class="stack" use:enhance>
		<label class="field">
			Name <input class="input" name="name" value={data.account.name} required />
		</label>
		<label class="field">
			Benutzername
			<input
				class="input"
				name="username"
				value={data.account.username}
				autocapitalize="none"
				spellcheck="false"
				required
			/>
			<span class="hint"
				>Die alte Adresse leitet weiter und bleibt 6 Monate für dich reserviert.</span
			>
		</label>
		<div class="row"><button type="submit" class="btn">Speichern</button></div>
	</form>

	<h2>E-Mail-Adresse</h2>
	{#if editingEmail}
		<form
			method="POST"
			action="?/email"
			class="stack"
			use:enhance={() =>
				async ({ result, update }) => {
					await update();
					if (result.type === 'success') editingEmail = false;
				}}
		>
			<label class="field">
				Neue E-Mail-Adresse für dein Konto
				<!-- svelte-ignore a11y_autofocus -->
				<input
					class="input"
					type="email"
					name="email"
					value={data.account.email}
					autocomplete="email"
					required
					autofocus
				/>
				<span class="hint"
					>Wir schicken einen Bestätigungslink an die neue Adresse. Bis du ihn öffnest, gilt die
					bisherige.</span
				>
			</label>
			<div class="row">
				<button type="button" class="btn btn--quiet" onclick={() => (editingEmail = false)}
					>Abbrechen</button
				>
				<button type="submit" class="btn">Bestätigungslink schicken</button>
			</div>
		</form>
	{:else}
		<div class="list-row">
			<span>{data.account.email}</span>
			<button type="button" class="btn btn--quiet" onclick={() => (editingEmail = true)}
				>Ändern</button
			>
		</div>
	{/if}

	<h2>Passkeys</h2>
	<div class="stack">
		{#if passkeys?.length}
			<ul class="list">
				{#each passkeys as passkey (passkey.id)}
					<li>
						<span>{passkey.name ?? 'Passkey'}</span>
						<span class="row">
							<button
								type="button"
								class="btn btn--quiet"
								onclick={() => (naming = { id: passkey.id, name: passkey.name ?? '' })}
								>Umbenennen</button
							>
							<button
								type="button"
								class="btn btn--quiet btn--danger"
								onclick={() => removePasskey(passkey.id)}>Entfernen</button
							>
						</span>
					</li>
				{/each}
			</ul>
		{:else if passkeys}
			<p class="hint">Noch kein Passkey. Mit einem Passkey meldest du dich ohne Mail an.</p>
		{/if}
		{#if passkeyError}<p class="message message--error">{passkeyError}</p>{/if}
		<div class="row">
			<button type="button" class="btn" onclick={() => (naming = { id: null, name: deviceName() })}>
				<KeyRound size="1em" aria-hidden="true" /> Passkey hinzufügen
			</button>
			<form method="POST" action="?/signOutOthers" use:enhance>
				<button type="submit" class="btn btn--quiet">Auf allen Geräten abmelden</button>
			</form>
		</div>
	</div>

	<Dialog
		open={naming !== null}
		title={naming?.id ? 'Passkey umbenennen' : 'Passkey hinzufügen'}
		onclose={() => (naming = null)}
	>
		{#if naming}
			<form
				id="passkey-name"
				onsubmit={(event) => {
					event.preventDefault();
					savePasskeyName();
				}}
			>
				<label class="field">
					Name, damit du ihn wiedererkennst
					<!-- svelte-ignore a11y_autofocus -->
					<input
						class="input"
						bind:value={naming.name}
						maxlength="60"
						placeholder="z. B. iPhone oder 1Password"
						required
						autofocus
					/>
				</label>
			</form>
		{/if}
		{#snippet actions()}
			<button type="button" class="btn btn--quiet" onclick={() => (naming = null)}>Abbrechen</button
			>
			<button type="submit" class="btn btn--primary" form="passkey-name"
				>{naming?.id ? 'Speichern' : 'Weiter'}</button
			>
		{/snippet}
	</Dialog>

	<h2>Kochbücher</h2>
	<ul class="list">
		{#each data.cookbooks as cookbook (cookbook.id)}
			<li>
				<a href={cookbookPath(cookbook)}>{cookbook.name}</a>
				<span class="hint"
					>{cookbook.role === 'owner' ? 'Besitzer' : `von @${cookbook.ownerUsername}`}</span
				>
			</li>
		{/each}
		{#each data.deletedCookbooks as cookbook (cookbook.id)}
			<li>
				<span>{cookbook.name} <span class="hint">im Papierkorb</span></span>
				<form method="POST" action="?/restoreCookbook" use:enhance>
					<input type="hidden" name="id" value={cookbook.id} />
					<button type="submit" class="btn btn--quiet">Wiederherstellen</button>
				</form>
			</li>
		{/each}
	</ul>
	<form method="POST" action="?/createCookbook" class="row new-cookbook" use:enhance>
		<input
			class="input"
			name="name"
			placeholder="Name, z. B. Weihnachten"
			aria-label="Name des neuen Kochbuchs"
			maxlength="80"
			required
		/>
		<button type="submit" class="btn">Neues Kochbuch</button>
	</form>

	<h2>Speicher für Bilder</h2>
	<div class="stack">
		<div
			class="bar"
			role="meter"
			aria-valuemin={0}
			aria-valuemax={data.storage.limit}
			aria-valuenow={data.storage.used}
			aria-label="Belegter Speicher"
		>
			<span style="width: {share * 100}%"></span>
		</div>
		<p class="hint">
			{megabytes(data.storage.used)} von {megabytes(data.storage.limit)} belegt.
			{#if data.storage.full}
				Neue Bilder sind erst wieder möglich, wenn du Platz schaffst.
			{:else if share >= 0.8}
				Der Speicher ist bald voll.
			{/if}
			Bilder in alten Versionen und im Papierkorb zählen mit.
		</p>
	</div>

	<h2>Deine Daten</h2>
	<p>
		<a class="btn" href={resolve('/konto/export')} data-sveltekit-reload>Daten herunterladen</a>
	</p>

	{#if !data.account.deletionAt}
		<h2>Konto löschen</h2>
		<button type="button" class="btn btn--danger" onclick={() => (confirmDeletion = true)}
			>Konto löschen</button
		>
		<Dialog bind:open={confirmDeletion} title="Konto löschen?">
			<p>
				Dein Konto und alle Kochbücher, die nur du bearbeitest, werden nach {data.deletionDays} Tagen
				gelöscht. Bis dahin kannst du es dir anders überlegen.
			</p>
			<p class="hint">
				Rezepte in gemeinsamen Kochbüchern bleiben dort. Kopien, die andere übernommen haben,
				bleiben ebenfalls bestehen, dein Name wird dort entfernt.
			</p>
			<form
				id="request-deletion"
				method="POST"
				action="?/requestDeletion"
				use:enhance={() =>
					async ({ update }) => {
						confirmDeletion = false;
						await update();
					}}
			></form>
			{#snippet actions()}
				<button type="button" class="btn btn--quiet" onclick={() => (confirmDeletion = false)}
					>Abbrechen</button
				>
				<button type="submit" class="btn btn--danger" form="request-deletion">Konto löschen</button>
			{/snippet}
		</Dialog>
	{/if}
</div>

<style>
	.deletion {
		margin-bottom: 2rem;
		padding: 1.25rem;
		border: 2px solid #b3261e;
		border-radius: var(--radius-md);
	}
	.deletion p {
		margin: 0;
	}
	.deletion-title {
		font-size: 1.25rem;
		color: #b3261e;
	}
	.list {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--color-border);
	}
	.list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-height: 3rem;
		border-bottom: 1px solid var(--color-border);
	}
	.list-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-height: 3rem;
		border-bottom: 1px solid var(--color-border);
		overflow-wrap: anywhere;
	}
	.list a {
		color: var(--color-text);
	}
	.new-cookbook {
		margin-top: 1rem;
	}
	.new-cookbook .input {
		flex: 1;
		min-width: 12rem;
	}
	.bar {
		height: 0.5rem;
		overflow: hidden;
		background: var(--color-surface-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--color-dark);
	}
</style>
