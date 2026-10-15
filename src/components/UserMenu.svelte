<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Avatar from '#components/Avatar.svelte';
	import { me } from '#lib/me.svelte.js';
	import { cookbookPath, profilePath } from '#lib/paths.js';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Plus from '@lucide/svelte/icons/plus';
	import Dialog from '#components/Dialog.svelte';

	let open = $state(false);
	let root = $state<HTMLDivElement>();

	const user = $derived(me.current?.user);

	const signOut = async () => {
		open = false;
		await fetch('/api/auth/sign-out', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: '{}'
		});
		await me.refresh();
		await goto(resolve('/'), { invalidateAll: true });
	};

	let creating = $state(false);
	let newName = $state('');
	let createError = $state<string | null>(null);

	const createCookbook = async (event: SubmitEvent) => {
		event.preventDefault();
		createError = null;
		const response = await fetch('/api/kochbuch', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name: newName })
		});
		const body = await response.json().catch(() => null);
		if (!response.ok) {
			createError = body?.message ?? 'Das Kochbuch konnte nicht angelegt werden.';
			return;
		}
		creating = false;
		newName = '';
		await me.refresh();
		await goto(body.path);
	};

	const close = (event: Event) => {
		if (!root?.contains(event.target as Node)) open = false;
	};
</script>

<svelte:window
	onclick={close}
	onkeydown={(event) => {
		if (event.key === 'Escape') open = false;
	}}
/>

{#if user}
	<div class="menu" bind:this={root}>
		<button
			type="button"
			class="trigger"
			aria-expanded={open}
			aria-controls="user-menu"
			aria-label="Menü von {user.name}"
			onclick={() => (open = !open)}
		>
			<Avatar name={user.name} size="2.25rem" />
		</button>
		{#if open}
			<ul id="user-menu" class="items">
				<li class="who">{user.name}<span>@{user.username}</span></li>
				<li>
					<a href={profilePath(user.username)} onclick={() => (open = false)}>Meine Rezepte</a>
				</li>
				<li class="group" aria-hidden="true">Kochbücher</li>
				{#each me.current?.cookbooks ?? [] as cookbook (cookbook.id)}
					<li>
						<a class="cookbook" href={cookbookPath(cookbook)} onclick={() => (open = false)}>
							<BookOpen size="1em" aria-hidden="true" />
							<span>
								{cookbook.name}
								{#if cookbook.role !== 'owner'}<small>von @{cookbook.ownerUsername}</small>{/if}
							</span>
						</a>
					</li>
				{/each}
				<li>
					<button
						type="button"
						class="cookbook muted"
						onclick={() => {
							open = false;
							creating = true;
						}}><Plus size="1em" aria-hidden="true" /> Neues Kochbuch</button
					>
				</li>
				<li class="separator" aria-hidden="true"></li>
				<li><a href={resolve('/neu')} onclick={() => (open = false)}>Neues Rezept</a></li>
				<li><a href={resolve('/import')} onclick={() => (open = false)}>Rezept importieren</a></li>
				<li><a href={resolve('/konto')} onclick={() => (open = false)}>Konto</a></li>
				{#if user.role === 'admin'}
					<li><a href={resolve('/admin')} onclick={() => (open = false)}>Verwaltung</a></li>
				{/if}
				<li><button type="button" onclick={signOut}>Abmelden</button></li>
			</ul>
		{/if}
	</div>
	<Dialog bind:open={creating} title="Neues Kochbuch">
		<form id="new-cookbook" onsubmit={createCookbook}>
			<label class="field">
				Name
				<!-- svelte-ignore a11y_autofocus -->
				<input
					class="input"
					bind:value={newName}
					placeholder="z. B. Grillen oder Weihnachten"
					maxlength="80"
					required
					autofocus
				/>
			</label>
			{#if createError}<p class="message message--error" role="alert">{createError}</p>{/if}
		</form>
		<p class="hint">Danach kannst du das Kochbuch mit anderen teilen.</p>
		{#snippet actions()}
			<button type="button" class="btn btn--quiet" onclick={() => (creating = false)}
				>Abbrechen</button
			>
			<button type="submit" class="btn btn--primary" form="new-cookbook" disabled={!newName.trim()}
				>Anlegen</button
			>
		{/snippet}
	</Dialog>
{:else if me.current?.needsOnboarding}
	<a class="btn" href={resolve('/willkommen')}>Registrierung abschließen</a>
{:else if me.current}
	<a class="btn" href={resolve('/anmelden')}>Anmelden</a>
{/if}

<style>
	.menu {
		position: relative;
	}
	.trigger {
		display: flex;
		padding: 0;
		background: none;
		border: none;
		border-radius: 50%;
		cursor: pointer;
	}
	.items {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		z-index: 20;
		min-width: 14rem;
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
		margin: 0;
		padding: 0.4rem 0;
		list-style: none;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: 0 4px 16px rgb(0 0 0 / 0.08);
	}
	.who {
		display: flex;
		flex-direction: column;
		padding: 0.5rem 1rem 0.6rem;
		margin-bottom: 0.3rem;
		font-size: 0.9375rem;
		border-bottom: 1px solid var(--color-border);
	}
	.who span {
		font-size: 0.8125rem;
		color: var(--color-text-subtle);
	}
	.items a,
	.items button {
		display: block;
		width: 100%;
		padding: 0.55rem 1rem;
		font: inherit;
		font-size: 0.9375rem;
		text-align: left;
		color: var(--color-text);
		text-decoration: none;
		background: none;
		border: none;
		cursor: pointer;
	}
	.group {
		padding: 0.6rem 1rem 0.2rem;
		font-size: 0.75rem;
		color: var(--color-text-subtle);
	}
	.items .cookbook {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.cookbook :global(svg) {
		flex: none;
		color: var(--color-text-subtle);
	}
	.cookbook small {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-subtle);
	}
	.items .muted {
		color: var(--color-text-muted);
	}
	.separator {
		margin: 0.3rem 0;
		border-top: 1px solid var(--color-border);
	}
	.items a:hover,
	.items button:hover {
		background: var(--color-surface-muted);
	}
</style>
