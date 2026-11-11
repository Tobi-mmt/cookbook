<script lang="ts">
	import { enhance } from '$app/forms';
	import FileDown from '@lucide/svelte/icons/file-down';
	import { cookbookPath, recipePath } from '#lib/paths.js';
	import { SITE_NAME } from '#lib/site.js';

	type Quality = 'lesen' | 'druck';
	type File = { url: string; bytes: number; pages: number };

	let {
		data,
		form
	}: {
		data: {
			cookbook: { name: string; slug: string; ownerUsername: string };
			count: number;
			limit: number;
			soft: { id: string; title: string; dpi: number; omitted: boolean }[];
			ready: Partial<Record<Quality, File>>;
		};
		form: ({ quality: Quality } & File) | { error: string } | null;
	} = $props();

	const options: { quality: Quality; title: string; text: string }[] = [
		{
			quality: 'lesen',
			title: 'Zum Lesen',
			text: 'Kleinere Datei für Bildschirm, Tablet und zum Verschicken.'
		},
		{
			quality: 'druck',
			title: 'Zum Drucken',
			text: 'Bilder in voller Auflösung für den eigenen Drucker. Die Datei wird deutlich größer.'
		}
	];

	let busy = $state<Quality | null>(null);
	const files = $derived({
		...data.ready,
		...(form && 'url' in form ? { [form.quality]: form } : {})
	} as Partial<Record<Quality, File>>);
	const error = $derived(form && 'error' in form ? form.error : null);
	const tooMany = $derived(data.count > data.limit);

	const megabytes = (bytes: number) =>
		(bytes / 1024 / 1024).toLocaleString('de-DE', { maximumFractionDigits: 1 });
</script>

<svelte:head>
	<title>{data.cookbook.name} als PDF - {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<p class="back"><a href={cookbookPath(data.cookbook)}>← {data.cookbook.name}</a></p>
	<h1>Als PDF</h1>

	<p class="hint">
		Ein Rezeptbuch aus allen Rezepten dieses Kochbuchs: Titelseite, Inhaltsverzeichnis nach
		Kategorien und eine A4-Seite pro Rezept, lange Rezepte bekommen eine zweite Seite. Willst du nur
		einen Teil der Rezepte drucken, lege dafür ein eigenes Kochbuch an.
	</p>

	{#if error}<p class="message message--error" role="alert">{error}</p>{/if}

	{#if !data.count}
		<p class="message">Das Kochbuch hat noch keine Rezepte.</p>
	{:else if tooMany}
		<p class="message">
			Ein PDF kann höchstens {data.limit} Rezepte enthalten, dieses Kochbuch hat {data.count}. Teile
			die Rezepte auf mehrere Kochbücher auf, dann bekommt jedes sein eigenes PDF.
		</p>
	{:else}
		<ul class="options">
			{#each options as option (option.quality)}
				{@const file = files[option.quality]}
				<li>
					<div>
						<h2>{option.title}</h2>
						<p class="hint">{option.text}</p>
						{#if file}
							<p class="hint">{file.pages} Seiten, {megabytes(file.bytes)} MB</p>
						{/if}
					</div>
					{#if file}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- the file is in Vercel Blob -->
						<a class="btn btn--primary" href={file.url} download
							><FileDown size="1.1em" aria-hidden="true" /> Herunterladen</a
						>
					{:else}
						<form
							method="POST"
							use:enhance={() => {
								busy = option.quality;
								return async ({ update }) => {
									await update({ reset: false });
									busy = null;
								};
							}}
						>
							<input type="hidden" name="quality" value={option.quality} />
							<button type="submit" class="btn btn--primary" disabled={busy !== null}>
								{busy === option.quality ? 'Wird erzeugt …' : 'PDF erzeugen'}
							</button>
						</form>
					{/if}
				</li>
			{/each}
		</ul>
		{#if busy}
			<p class="hint" role="status">
				Das dauert bei {data.count} Rezepten bis zu einer Minute. Lass die Seite so lange offen.
			</p>
		{/if}

		{#if data.soft.length}
			<h2>Bilder, die im Druck klein werden</h2>
			<p class="hint">
				Diese Bilder haben zu wenig Pixel für die ganze Seitenbreite. Sie werden kleiner neben den
				Titel gesetzt oder weggelassen. Lade ein größeres Foto hoch, damit es die ganze Breite
				füllt.
			</p>
			<ul class="soft">
				{#each data.soft as recipe (recipe.id)}
					<li>
						<a href={recipePath(recipe)}>{recipe.title}</a>
						<span class="hint">{recipe.omitted ? 'wird weggelassen' : 'wird kleiner gedruckt'}</span
						>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>

<style>
	.back {
		margin: 0 0 1rem;
		font-size: 0.875rem;
	}
	.back a {
		color: var(--color-text-muted);
		text-decoration: none;
	}
	.message {
		margin-top: 1.5rem;
	}
	.options {
		margin: 1.5rem 0 1rem;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--color-border);
	}
	.options li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.25rem 0;
		border-bottom: 1px solid var(--color-border);
	}
	.options li > div {
		flex: 1;
		min-width: 14rem;
	}
	.options h2 {
		margin: 0 0 0.25rem;
	}
	.options .btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.soft {
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;
	}
	.soft li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: baseline;
		padding: 0.4rem 0;
	}
	.soft a {
		color: var(--color-text);
	}
</style>
