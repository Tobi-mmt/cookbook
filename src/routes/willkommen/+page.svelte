<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { me } from '#lib/me.svelte.js';
	import { validateUsername } from '#lib/username.js';
	import PasskeyPrompt from '#components/PasskeyPrompt.svelte';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: {
			next: string;
			done: boolean;
			name: string;
			username: string;
			hasPasskeys: boolean;
			remember: boolean;
		};
		form: { saved?: boolean; name?: string; username?: string; error?: string } | null;
	} = $props();

	// svelte-ignore state_referenced_locally
	let username = $state(form?.username ?? data.username);
	let usernameError = $state<string | null>(null);
	let saving = $state(false);

	const showPasskeyStep = $derived(data.done || form?.saved);
	$effect(() => {
		if (form?.saved) me.refresh();
	});

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
</script>

<svelte:head>
	<title>Willkommen - {SITE_NAME}</title>
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
					Ich stimme den <a href={resolve('/nutzungsbedingungen')} target="_blank"
						>Nutzungsbedingungen</a
					>
					und der <a href={resolve('/datenschutz')} target="_blank">Datenschutzerklärung</a> zu.
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
		<PasskeyPrompt next={data.next} hasPasskeys={data.hasPasskeys} remember={data.remember} />
	{/if}
</div>

<style>
	a {
		color: inherit;
	}
</style>
