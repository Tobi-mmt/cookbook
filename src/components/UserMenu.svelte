<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Avatar from '#components/Avatar.svelte';
	import { me } from '#lib/me.svelte.js';
	import { profilePath } from '#lib/paths.js';

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
				<li><a href={resolve('/neu')} onclick={() => (open = false)}>Neues Rezept</a></li>
				<li><a href={resolve('/import')} onclick={() => (open = false)}>Rezept importieren</a></li>
				{#if user.role === 'admin'}
					<li><a href={resolve('/admin')} onclick={() => (open = false)}>Verwaltung</a></li>
				{/if}
				<li><button type="button" onclick={signOut}>Abmelden</button></li>
			</ul>
		{/if}
	</div>
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
	.items a:hover,
	.items button:hover {
		background: var(--color-surface-muted);
	}
</style>
