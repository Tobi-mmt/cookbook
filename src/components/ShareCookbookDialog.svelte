<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Dialog from '#components/Dialog.svelte';

	let {
		open = $bindable(false),
		title,
		cookbook
	}: {
		open?: boolean;
		title: string;
		cookbook: { id: string; name: string; path: string };
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

<Dialog bind:open {title}>
	<p>Mit jemandem teilen? Wer eingeladen ist, kann alle Rezepte in „{cookbook.name}“ bearbeiten.</p>

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
		<button type="button" class="btn btn--primary" disabled={busy} onclick={() => invite()}>
			<UserPlus size="1em" aria-hidden="true" /> Einladungslink erstellen
		</button>
	{/if}

	<form
		class="email"
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

	{#snippet actions()}
		<a class="btn" href={cookbook.path}>Zum Kochbuch</a>
		<button type="button" class="btn btn--primary" onclick={() => (open = false)}>Fertig</button>
	{/snippet}
</Dialog>

<style>
	.link {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.75rem;
		background: var(--color-surface-muted);
		border-radius: var(--radius-md);
	}
	.link code {
		overflow-wrap: anywhere;
		font-size: 0.875rem;
	}
	.email {
		display: flex;
		gap: 0.5rem;
	}
	.email .input {
		flex: 1;
		min-width: 0;
	}
</style>
