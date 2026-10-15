<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import { page } from '$app/state';
	import { validateUsername } from '#lib/username.js';

	let {
		data,
		form
	}: {
		data: { next: string; done: boolean; name: string; username: string };
		form: { saved?: boolean; name?: string; username?: string; error?: string } | null;
	} = $props();

	// svelte-ignore state_referenced_locally
	let username = $state(form?.username ?? data.username);
	let usernameError = $state<string | null>(null);
	let saving = $state(false);
	let passkeyError = $state<string | null>(null);

	const showPasskeyStep = $derived(data.done || form?.saved);

	let checkTimeout: ReturnType<typeof setTimeout> | undefined;
	const checkUsername = () => {
		clearTimeout(checkTimeout);
		usernameError = validateUsername(username);
		if (usernameError) return;
		checkTimeout = setTimeout(async () => {
			const response = await fetch(`/api/benutzername?name=${encodeURIComponent(username)}`);
			usernameError = (await response.json()).error;
		}, 300);
	};

	const addPasskey = async () => {
		passkeyError = null;
		const { authClient } = await import('#lib/authClient.js');
		const { error } = await authClient.passkey.addPasskey({
			name: navigator.platform || 'Passkey'
		});
		if (error) {
			passkeyError =
				'Der Passkey wurde nicht angelegt. Du kannst das später unter „Konto“ nachholen.';
			return;
		}
		await goto(data.next, { invalidateAll: true });
	};
</script>

<svelte:head>
	<title>Willkommen - Kochbuch</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page page--narrow">
	{#if !showPasskeyStep}
		<h1>Willkommen!</h1>
		<form
			method="POST"
			class="stack"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update({ reset: false });
					saving = false;
				};
			}}
		>
			<label class="field">
				Dein Name
				<input
					class="input"
					name="name"
					autocomplete="name"
					required
					value={form?.name ?? data.name}
				/>
			</label>
			<label class="field">
				Benutzername
				<input
					class="input"
					name="username"
					autocomplete="username"
					autocapitalize="none"
					spellcheck="false"
					required
					bind:value={username}
					oninput={checkUsername}
				/>
				<span class="hint">
					{#if usernameError}
						{usernameError}
					{:else}
						Deine Adresse: {page.url.host}/@{username || '…'}
					{/if}
				</span>
			</label>
			<label class="checkbox">
				<input type="checkbox" name="age" required />
				Ich bin mindestens 16 Jahre alt.
			</label>
			<label class="checkbox">
				<input type="checkbox" name="terms" required />
				<span>
					Ich stimme den <a href="/nutzungsbedingungen" target="_blank">Nutzungsbedingungen</a> und
					der <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> zu.
				</span>
			</label>
			<p class="message">
				Deine Rezepte sind für alle sichtbar und stehen unter
				<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.de" target="_blank"
					>CC BY-SA 4.0</a
				>: Jeder darf sie mit Namensnennung übernehmen und anpassen.
			</p>
			{#if form?.error}
				<p class="message message--error" role="alert">{form.error}</p>
			{/if}
			<button type="submit" class="btn btn--primary btn--block" disabled={saving}>
				{saving ? 'Wird gespeichert…' : 'Weiter'}
			</button>
		</form>
	{:else}
		<h1>Schneller anmelden</h1>
		<div class="stack">
			<p>
				Mit einem Passkey meldest du dich künftig per Fingerabdruck, Gesicht oder Geräte-PIN an,
				ganz ohne Mail.
			</p>
			<button type="button" class="btn btn--primary btn--block" onclick={addPasskey}>
				<KeyRound size="1.1em" aria-hidden="true" /> Passkey anlegen
			</button>
			{#if passkeyError}
				<p class="message message--error" role="alert">{passkeyError}</p>
			{/if}
			<a class="btn btn--quiet btn--block" href={data.next} data-sveltekit-reload>Später</a>
		</div>
	{/if}
</div>

<style>
	a {
		color: inherit;
	}
</style>
