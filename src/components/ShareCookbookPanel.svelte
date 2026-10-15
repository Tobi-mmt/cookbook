<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import UserPlus from '@lucide/svelte/icons/user-plus';

	let {
		message,
		cookbook,
		onclose
	}: {
		message: string;
		cookbook: { id: string; name: string; path: string };
		onclose: () => void;
	} = $props();

	let link = $state<string | null>(null);
	let email = $state('');
	let sentTo = $state<string | null>(null);
	let busy = $state(false);
	let copied = $state(false);
	let error = $state<string | null>(null);

	const invite = async (withEmail = false) => {
		busy = true;
		error = null;
		const response = await fetch(`/api/kochbuch/${cookbook.id}/einladung`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(withEmail ? { email } : {})
		});
		busy = false;
		const body = await response.json().catch(() => null);
		if (!response.ok) {
			error = body?.message ?? 'Die Einladung hat nicht geklappt.';
			return;
		}
		link = body.link;
		sentTo = body.sentTo;
		if (withEmail) email = '';
	};

	const copy = async () => {
		if (!link) return;
		await navigator.clipboard.writeText(link).catch(() => {});
		copied = true;
	};
</script>

<div class="panel" role="status">
	<p class="title">{message}</p>
	<p class="hint">Mit jemandem teilen? Wer eingeladen ist, kann alle Rezepte darin bearbeiten.</p>

	{#if link}
		<div class="link">
			<code>{link}</code>
			<button type="button" class="btn" onclick={copy}>
				<Copy size="1em" aria-hidden="true" />
				{copied ? 'Kopiert' : 'Link kopieren'}
			</button>
		</div>
		<p class="hint">Der Link gilt 7 Tage und lässt sich in den Einstellungen widerrufen.</p>
	{:else}
		<div class="row">
			<button type="button" class="btn btn--primary" disabled={busy} onclick={() => invite()}>
				<UserPlus size="1em" aria-hidden="true" /> Einladungslink erstellen
			</button>
		</div>
	{/if}

	<form
		class="row"
		onsubmit={(event) => {
			event.preventDefault();
			invite(true);
		}}
	>
		<input
			class="input"
			type="email"
			bind:value={email}
			placeholder="oder per E-Mail einladen"
			aria-label="E-Mail-Adresse der Person"
			required
		/>
		<button type="submit" class="btn" disabled={busy}>Einladen</button>
	</form>
	{#if sentTo}<p class="hint">Die Einladung ist an {sentTo} unterwegs.</p>{/if}
	{#if error}<p class="message message--error" role="alert">{error}</p>{/if}

	<div class="row">
		<a class="btn" href={cookbook.path}>Zum Kochbuch „{cookbook.name}“</a>
		<button type="button" class="btn btn--quiet" onclick={onclose}>Schließen</button>
	</div>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
		padding: 1rem 1.25rem;
		background: var(--color-surface-muted);
		border-radius: var(--radius-md);
	}
	.title {
		margin: 0;
	}
	.link {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}
	.link code {
		overflow-wrap: anywhere;
	}
	form .input {
		flex: 1;
		min-width: 12rem;
	}
</style>
