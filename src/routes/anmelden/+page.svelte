<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Captcha from '#components/Captcha.svelte';
	import { me } from '#lib/me.svelte.js';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import {
		conditionalSignInAvailable,
		isBrowserError,
		passkeyOnDevice,
		signInWithPasskey
	} from '#lib/passkeys.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: { next: string; linkFailed: boolean; remember: boolean };
		form: { sent?: string; email?: string; error?: string } | null;
	} = $props();

	let captcha = $state('');
	// svelte-ignore state_referenced_locally
	let remember = $state(data.remember);
	let sending = $state(false);
	let passkeyError = $state<string | null>(null);
	/** the order itself comes from app.html before the first paint, this only swaps the colors */
	let passkeyFirst = $state(false);
	let rememberForm = $state<HTMLFormElement>();

	const failed =
		'Die Anmeldung mit Passkey hat nicht geklappt. Hast du auf diesem Gerät oder Handy einen Passkey angelegt? Noch kein Konto? Dann lass dir zuerst einen Link per E-Mail schicken, danach kannst du einen Passkey anlegen.';

	/** the passkey sign-in has to find the choice in a cookie, also when it starts from the autofill */
	let savingRemember: Promise<unknown> = Promise.resolve();
	const saveRemember = () => {
		if (!rememberForm) return;
		savingRemember = fetch('?/remember', { method: 'POST', body: new FormData(rememberForm) });
	};

	const signedIn = async () => {
		await me.refresh();
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- the server checked the target
		await goto(data.next, { invalidateAll: true });
	};

	/**
	 * Waits in the background: the browser offers existing passkeys in the autofill of the e-mail
	 * field and shows nothing when there are none, so nobody needs a mail who has a passkey.
	 */
	const offerPasskeysInAutofill = async () => {
		if (!(await conditionalSignInAvailable())) return;
		const error = await signInWithPasskey(true);
		if (!error) return signedIn();
		if (!isBrowserError(error)) passkeyError = failed;
	};

	onMount(() => {
		passkeyFirst = passkeyOnDevice();
		offerPasskeysInAutofill();
	});

	const signInWithButton = async () => {
		passkeyError = null;
		await savingRemember;
		// starting this cancels the request of the autofill
		const error = await signInWithPasskey();
		if (!error) return signedIn();
		passkeyError = failed;
		offerPasskeysInAutofill();
	};
</script>

<svelte:head>
	<title>Anmelden - {SITE_NAME}</title>
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
				Keine Mail bekommen? Schau im Spam-Ordner nach oder
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- only the query of the current page changes -->
				<a href="?weiter={data.next}">fordere einen neuen Link an</a>.
			</p>
		</div>
	{:else}
		<div class="options">
			<form
				method="POST"
				action="?/link"
				class="stack mail"
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
					Wir schicken dir einen Link per E-Mail, ein Passwort gibt es nicht. Hast du noch kein
					Konto, legen wir eins an. Hast du einen Passkey, schlägt ihn dein Browser im Feld vor.
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
					<input type="checkbox" name="remember" bind:checked={remember} onchange={saveRemember} />
					Auf diesem Gerät angemeldet bleiben
				</label>
				<input type="hidden" name="next" value={data.next} />
				<Captcha bind:value={captcha} />
				{#if form?.error}
					<p class="message message--error" role="alert">{form.error}</p>
				{/if}
				<button
					type="submit"
					class="btn btn--block"
					class:btn--primary={!passkeyFirst}
					disabled={sending || !captcha}
				>
					{sending ? 'Wird verschickt…' : captcha ? 'Link schicken' : 'Einen Moment…'}
				</button>
			</form>

			<p class="divider">oder</p>

			<div class="stack passkey">
				<button
					type="button"
					class="btn btn--block"
					class:btn--primary={passkeyFirst}
					onclick={signInWithButton}
				>
					<KeyRound size="1.1em" aria-hidden="true" /> Mit Passkey anmelden
				</button>
				{#if passkeyError}
					<p class="message message--error" role="alert">{passkeyError}</p>
				{/if}
				<p class="hint">
					Nur für bestehende Konten mit Passkey. Ein neues Konto legst du über den Link per E-Mail
					an. An einem fremden Gerät kannst du den Passkey auf deinem Handy nutzen: Der Browser
					zeigt dafür einen QR-Code.
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.options {
		display: flex;
		flex-direction: column;
	}
	.divider {
		margin: 2rem 0;
	}
	/* with a passkey on this device the mail is only the fallback */
	:global(html.passkey-device) .passkey {
		order: -1;
	}
	:global(html.passkey-device) .mail {
		order: 1;
	}
	a {
		color: inherit;
	}
</style>
