<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Captcha from '#components/Captcha.svelte';
	import KeyRound from '@lucide/svelte/icons/key-round';

	let {
		data,
		form
	}: {
		data: { next: string; linkFailed: boolean };
		form: { sent?: string; email?: string; error?: string } | null;
	} = $props();

	let captcha = $state('');
	let remember = $state(true);
	let sending = $state(false);
	let passkeyError = $state<string | null>(null);
	let rememberForm = $state<HTMLFormElement>();

	const signInWithPasskey = async () => {
		passkeyError = null;
		// stores the choice for "angemeldet bleiben" before the session is created
		await fetch('?/remember', { method: 'POST', body: new FormData(rememberForm) });
		const { authClient } = await import('#lib/authClient.js');
		const { error } = await authClient.signIn.passkey();
		if (error) {
			passkeyError =
				'Die Anmeldung mit Passkey hat nicht geklappt. Hast du auf diesem Gerät oder Handy einen Passkey angelegt?';
			return;
		}
		await goto(data.next, { invalidateAll: true });
	};
</script>

<svelte:head>
	<title>Anmelden - Kochbuch</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page page--narrow">
	<h1>Anmelden oder registrieren</h1>

	{#if form?.sent}
		<div class="stack">
			<p class="message" role="status">
				Ein Anmelde-Link ist unterwegs an <strong>{form.sent}</strong>. Er ist 15 Minuten gültig. Du
				kannst ihn auch auf einem anderen Gerät öffnen.
			</p>
			<p class="hint">
				Keine Mail bekommen? Schau im Spam-Ordner nach oder <a href="?weiter={data.next}"
					>fordere einen neuen Link an</a
				>.
			</p>
		</div>
	{:else}
		<form
			method="POST"
			action="?/link"
			class="stack"
			bind:this={rememberForm}
			use:enhance={() => {
				sending = true;
				return async ({ update }) => {
					await update({ reset: false });
					sending = false;
				};
			}}
		>
			{#if data.linkFailed}
				<p class="message message--error" role="alert">
					Der Link ist abgelaufen oder wurde schon benutzt. Fordere einfach einen neuen an.
				</p>
			{/if}
			<p class="hint">
				Wir schicken dir einen Link per E-Mail, ein Passwort gibt es nicht. Hast du noch kein Konto,
				legen wir eins an.
			</p>
			<label class="field">
				E-Mail-Adresse
				<input
					class="input"
					type="email"
					name="email"
					autocomplete="email webauthn"
					required
					value={form?.email ?? ''}
				/>
			</label>
			<label class="checkbox">
				<input type="checkbox" name="remember" bind:checked={remember} />
				Auf diesem Gerät angemeldet bleiben
			</label>
			<input type="hidden" name="next" value={data.next} />
			<Captcha bind:value={captcha} />
			{#if form?.error}
				<p class="message message--error" role="alert">{form.error}</p>
			{/if}
			<button type="submit" class="btn btn--primary btn--block" disabled={sending || !captcha}>
				{sending ? 'Wird verschickt…' : captcha ? 'Link schicken' : 'Einen Moment…'}
			</button>
		</form>

		<p class="divider">oder</p>

		<div class="stack">
			<button type="button" class="btn btn--block" onclick={signInWithPasskey}>
				<KeyRound size="1.1em" aria-hidden="true" /> Mit Passkey anmelden
			</button>
			{#if passkeyError}
				<p class="message message--error" role="alert">{passkeyError}</p>
			{/if}
			<p class="hint">
				An einem fremden Gerät kannst du den Passkey auf deinem Handy nutzen: Der Browser zeigt
				dafür einen QR-Code.
			</p>
		</div>
	{/if}
</div>

<style>
	.divider {
		margin: 2rem 0;
	}
	a {
		color: inherit;
	}
</style>
