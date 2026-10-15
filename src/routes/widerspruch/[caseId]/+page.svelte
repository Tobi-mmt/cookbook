<script lang="ts">
	import { enhance } from '$app/forms';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data,
		form
	}: {
		data: { title: string; decision: string | null; reason: string | null };
		form: { sent?: boolean; error?: string } | null;
	} = $props();
</script>

<svelte:head>
	<title>Widerspruch - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page page--narrow">
	<h1>Widerspruch</h1>
	{#if form?.sent}
		<p class="message" role="status">
			Danke, wir prüfen deinen Widerspruch und melden uns per Mail.
		</p>
	{:else}
		<form method="POST" class="stack" use:enhance>
			<p>„{data.title}“: {data.decision}</p>
			{#if data.reason}<p class="hint">Begründung: {data.reason}</p>{/if}
			<label class="field">
				Warum bist du nicht einverstanden?
				<textarea class="input" name="reason" required></textarea>
			</label>
			{#if form?.error}<p class="message message--error" role="alert">{form.error}</p>{/if}
			<button type="submit" class="btn btn--primary">Widerspruch einlegen</button>
			<p class="hint">Du kannst gegen jede Entscheidung einmal Widerspruch einlegen.</p>
		</form>
	{/if}
</div>
