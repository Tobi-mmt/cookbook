<script lang="ts">
	import Flag from '@lucide/svelte/icons/flag';
	import X from '@lucide/svelte/icons/x';
	import Captcha from '#components/Captcha.svelte';
	import { me } from '#lib/me.svelte.js';
	import {
		REPORT_REASON_OPTIONS,
		REPORT_TARGET_LABELS,
		type ReportTarget
	} from '#lib/reportReasons.js';

	let { targets }: { targets: { type: ReportTarget; id: string }[] } = $props();

	let dialog = $state<HTMLDialogElement>();
	let open = $state(false);
	// svelte-ignore state_referenced_locally
	let target = $state(targets[0]);
	let reason = $state<string | null>(null);
	let comment = $state('');
	let originalUrl = $state('');
	let isRightsHolder = $state<'yes' | 'no' | null>(null);
	let email = $state('');
	let captcha = $state('');
	let sending = $state(false);
	let sent = $state(false);
	let error = $state<string | null>(null);

	const options = $derived(
		REPORT_REASON_OPTIONS.filter(({ targets: only }) => !only || only.includes(target.type))
	);
	const option = $derived(options.find(({ id }) => id === reason));
	const signedIn = $derived(Boolean(me.current?.user));

	const show = () => {
		open = true;
		sent = false;
		error = null;
		dialog?.showModal();
	};

	const submit = async (event: SubmitEvent) => {
		event.preventDefault();
		sending = true;
		error = null;
		const response = await fetch('/api/melden', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				targetType: target.type,
				targetId: target.id,
				reason,
				comment,
				originalUrl,
				isRightsHolder: isRightsHolder === null ? undefined : isRightsHolder === 'yes',
				email,
				captcha
			})
		});
		sending = false;
		if (response.ok) {
			sent = true;
			return;
		}
		error = (await response.json().catch(() => null))?.error ?? 'Das hat nicht geklappt.';
		// a captcha solution counts once, {#key error} solves a new one
		captcha = '';
	};
</script>

<button type="button" class="report" onclick={show}>
	<Flag size="0.9em" aria-hidden="true" /> Melden
</button>

<dialog bind:this={dialog} aria-label="Inhalt melden" onclose={() => (open = false)}>
	<form method="dialog" class="close">
		<button type="submit" class="btn btn--quiet" aria-label="Schließen"
			><X size="1.2em" aria-hidden="true" /></button
		>
	</form>
	{#if sent}
		<p>Danke, wir prüfen das.</p>
	{:else if open}
		<form class="stack" onsubmit={submit}>
			<h2>Melden</h2>
			{#if targets.length > 1}
				<fieldset class="stack">
					<legend>Was?</legend>
					{#each targets as item (item.type)}
						<label class="checkbox">
							<input
								type="radio"
								name="target"
								checked={target.type === item.type}
								onchange={() => (target = item)}
							/>
							{REPORT_TARGET_LABELS[item.type]}
						</label>
					{/each}
				</fieldset>
			{/if}
			<fieldset class="stack">
				<legend>Warum?</legend>
				{#each options as item (item.id)}
					<label class="checkbox">
						<input type="radio" name="reason" value={item.id} bind:group={reason} required />
						{item.label}
					</label>
				{/each}
			</fieldset>
			{#if reason === 'copyright'}
				<label class="field">
					Link zum Original
					<input class="input" type="url" bind:value={originalUrl} required />
				</label>
				<fieldset class="stack">
					<legend>Du bist …</legend>
					<label class="checkbox">
						<input type="radio" value="yes" bind:group={isRightsHolder} required />
						Rechteinhaber
					</label>
					<label class="checkbox">
						<input type="radio" value="no" bind:group={isRightsHolder} />
						im Auftrag des Rechteinhabers
					</label>
				</fieldset>
			{/if}
			{#if reason}
				<label class="field">
					{option?.needsComment ? 'Beschreibung' : 'Kommentar (optional)'}
					<textarea class="input" bind:value={comment} required={option?.needsComment}></textarea>
				</label>
			{/if}
			{#if !signedIn}
				<label class="field">
					{reason === 'copyright'
						? 'Deine E-Mail-Adresse'
						: 'E-Mail-Adresse, wenn du über das Ergebnis informiert werden möchtest'}
					<input class="input" type="email" bind:value={email} required={reason === 'copyright'} />
				</label>
			{/if}
			{#key error}<Captcha bind:value={captcha} />{/key}
			{#if error}<p class="message message--error" role="alert">{error}</p>{/if}
			<button type="submit" class="btn btn--primary" disabled={sending || !captcha || !reason}>
				{sending ? 'Wird gesendet…' : 'Absenden'}
			</button>
		</form>
	{/if}
</dialog>

<style>
	.report {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		padding: 0;
		font: inherit;
		font-size: 0.8125rem;
		color: var(--color-text-subtle);
		background: none;
		border: none;
		cursor: pointer;
	}
	.report:hover {
		color: var(--color-text-muted);
	}
	dialog {
		width: min(30rem, calc(100vw - 2rem));
		max-height: calc(100vh - 2rem);
		padding: 1.5rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	dialog::backdrop {
		background: rgb(0 0 0 / 0.3);
	}
	.close {
		float: right;
		margin: -1rem -1rem 0 0;
	}
	h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 400;
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: none;
	}
	legend {
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
</style>
