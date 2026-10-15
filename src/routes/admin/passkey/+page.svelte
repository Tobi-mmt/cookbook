<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import { SITE_NAME } from '#lib/site.js';

	let error = $state<string | null>(null);

	const signIn = async () => {
		error = null;
		const { authClient } = await import('#lib/authClient.js');
		const result = await authClient.signIn.passkey();
		if (result.error) {
			error = 'Die Anmeldung mit Passkey hat nicht geklappt.';
			return;
		}
		await goto(resolve('/admin'), { invalidateAll: true });
	};
</script>

<svelte:head>
	<title>Passkey nötig - {SITE_NAME}</title>
</svelte:head>

<div class="page page--narrow">
	<h1>Passkey nötig</h1>
	<div class="stack">
		<p>
			Den Admin-Bereich öffnest du nur mit einer Anmeldung per Passkey, ein Anmelde-Link per Mail
			reicht hier nicht.
		</p>
		<button type="button" class="btn btn--primary" onclick={signIn}>
			<KeyRound size="1em" aria-hidden="true" /> Mit Passkey anmelden
		</button>
		{#if error}<p class="message message--error" role="alert">{error}</p>{/if}
		<p class="hint">
			Hast du noch keinen Passkey, lege ihn zuerst unter <a href={resolve('/konto')}>Konto</a> an.
		</p>
	</div>
</div>
