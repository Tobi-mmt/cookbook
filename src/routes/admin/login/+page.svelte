<script lang="ts">
	let { form }: { form: { error?: string } | null } = $props();
</script>

<svelte:head>
	<title>Anmelden - Unser Kochbuch</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<form method="POST" class="login">
	<h1>Kochbuch verwalten</h1>
	<label>
		Passwort
		<!-- svelte-ignore a11y_autofocus -->
		<input type="password" name="password" autocomplete="current-password" required autofocus />
	</label>
	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}
	<button type="submit" class="button button--primary">Anmelden</button>
</form>

<style>
	.login {
		max-width: 22em;
		margin: 15vh auto 0;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}
	h1 {
		font-weight: 200;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
	}
</style>
