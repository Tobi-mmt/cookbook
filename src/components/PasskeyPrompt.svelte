<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import {
		askingStoppedOnDevice,
		canCreatePasskeyHere,
		createPasskey,
		deviceName,
		stopAskingOnDevice
	} from '#lib/passkeys.js';

	let {
		next,
		hasPasskeys,
		remember
	}: {
		next: string;
		/** the account has a passkey, just not necessarily on this device */
		hasPasskeys: boolean;
		/** "angemeldet bleiben" was off, probably somebody else's device */
		remember: boolean;
	} = $props();

	let ready = $state(false);
	let creating = $state(false);
	let error = $state<string | null>(null);
	let exists = $state(false);

	// replaces the entry, going back should not bring up the question again
	const skip = () => location.replace(next);

	onMount(async () => {
		if (!remember || askingStoppedOnDevice() || !(await canCreatePasskeyHere())) return skip();
		ready = true;
	});

	const add = async () => {
		error = null;
		creating = true;
		const result = await createPasskey(deviceName());
		creating = false;
		if (result === 'created') {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- the server checked the target
			await goto(next, { invalidateAll: true, replaceState: true });
		} else if (result === 'exists') {
			exists = true;
		} else {
			error = 'Der Passkey wurde nicht angelegt. Du kannst das später unter „Konto“ nachholen.';
		}
	};

	const stopAsking = () => {
		stopAskingOnDevice();
		skip();
	};
</script>

{#if ready}
	<h1>{hasPasskeys ? 'Passkey für dieses Gerät' : 'Schneller anmelden'}</h1>
	<div class="stack">
		{#if exists}
			<p class="message" role="status">
				Auf diesem Gerät gibt es schon einen Passkey für dein Konto. Melde dich nächstes Mal einfach
				damit an, dann brauchst du keine Mail.
			</p>
			<button type="button" class="btn btn--primary btn--block" onclick={skip}>Weiter</button>
		{:else}
			<p>
				{#if hasPasskeys}
					Lege auch auf diesem Gerät einen Passkey an. Dann meldest du dich hier künftig per
					Fingerabdruck, Gesicht oder Geräte-PIN an, ganz ohne Mail.
				{:else}
					Mit einem Passkey meldest du dich künftig per Fingerabdruck, Gesicht oder Geräte-PIN an,
					ganz ohne Mail. Er lässt sich nicht abfangen oder auf einer falschen Seite eingeben.
				{/if}
			</p>
			<button type="button" class="btn btn--primary btn--block" onclick={add} disabled={creating}>
				<KeyRound size="1.1em" aria-hidden="true" />
				{hasPasskeys ? 'Passkey für dieses Gerät anlegen' : 'Passkey anlegen'}
			</button>
			{#if error}
				<p class="message message--error" role="alert">{error}</p>
			{/if}
			<button type="button" class="btn btn--quiet btn--block" onclick={skip}>Später</button>
			<button type="button" class="btn btn--quiet btn--block" onclick={stopAsking}>
				Auf diesem Gerät nicht mehr fragen
			</button>
		{/if}
	</div>
{/if}
