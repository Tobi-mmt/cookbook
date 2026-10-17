<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { jsonLdScript } from '#lib/recipeText.js';
	import { SITE_NAME, SITE_TAGLINE } from '#lib/site.js';

	const description = `${SITE_NAME}: Rezepte digital speichern, aus Links importieren und zusammen mit Familie und Freunden in gemeinsamen Kochbüchern pflegen. Kostenlos und ohne Werbung.`;

	const questions = [
		{
			question: `Was ist die ${SITE_NAME}?`,
			answer: `Eine Seite für alle, die gern kochen: Du speicherst deine Rezepte digital, sammelst sie in Kochbüchern und pflegst diese allein oder gemeinsam mit anderen.`
		},
		{
			question: `Was kostet die ${SITE_NAME}?`,
			answer:
				'Nichts. Es gibt keine Werbung und keine Bezahlangebote, es ist ein privates, nicht kommerzielles Projekt.'
		},
		{
			question: 'Kann ich Rezepte von anderen Seiten übernehmen?',
			answer:
				'Ja. Füge den Link zu einem Rezept ein, die Zutaten und Schritte werden übernommen. Formuliere die Schritte danach in eigenen Worten und gib die Quelle an.'
		},
		{
			question: 'Kann ich mit meiner Familie ein gemeinsames Kochbuch führen?',
			answer:
				'Ja. Lade andere per Link oder E-Mail in dein Kochbuch ein, dann könnt ihr alle Rezepte darin bearbeiten. Frühere Versionen jedes Rezepts bleiben erhalten.'
		},
		{
			question: 'Sind meine Rezepte öffentlich?',
			answer:
				'Ja, alle Rezepte, Kochbücher und Profile sind für alle sichtbar. Es gibt keine privaten Inhalte.'
		},
		{
			question: 'Darf ich Rezepte anderer verwenden?',
			answer:
				'Ja. Alle Inhalte stehen unter CC BY-SA 4.0. Mit „In mein Kochbuch“ übernimmst du ein Rezept mit einem Klick, der Name der ursprünglichen Person bleibt dabei erhalten.'
		},
		{
			question: 'Wie melde ich mich an?',
			answer:
				'Mit deiner E-Mail-Adresse, wir schicken dir einen Anmelde-Link. Danach kannst du einen Passkey anlegen und dich per Fingerabdruck oder Gesicht anmelden. Passwörter gibt es nicht.'
		}
	];

	const structuredData = $derived(
		jsonLdScript({
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: questions.map(({ question, answer }) => ({
				'@type': 'Question',
				name: question,
				acceptedAnswer: { '@type': 'Answer', text: answer }
			}))
		})
	);
</script>

<svelte:head>
	<title>Über die {SITE_NAME} - {SITE_TAGLINE}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="{page.url.origin}/ueber" />
	<meta property="og:title" content="Über die {SITE_NAME}" />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="{page.url.origin}/og-image.png" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- escaped JSON of own data -->
	{@html structuredData}
</svelte:head>

<article class="page">
	<h1>Über die {SITE_NAME}</h1>
	<p class="lead">
		Die {SITE_NAME} ist für alle, die gern kochen: Deine Lieblingsrezepte liegen an einem Ort statt auf
		Zetteln, in Screenshots und Lesezeichen. Du sammelst sie in Kochbüchern und pflegst sie zusammen mit
		Familie und Freunden.
	</p>

	<h2>Was du hier tun kannst</h2>
	<ul>
		<li>
			Rezepte anlegen, mit Foto, Zutaten und Schritten, und die Mengen für deine Portionen
			umrechnen.
		</li>
		<li>Rezepte aus Links anderer Seiten importieren.</li>
		<li>Kochbücher teilen und gemeinsam bearbeiten, jede Änderung lässt sich nachvollziehen.</li>
		<li>Rezepte anderer mit einem Klick in dein eigenes Kochbuch übernehmen.</li>
		<li>
			Zutaten mit Bring! auf die Einkaufsliste setzen und dein Profil per QR-Code weitergeben.
		</li>
	</ul>
	<p class="actions">
		<a class="btn btn--primary" href={resolve('/anmelden')}>Eigenes Kochbuch anlegen</a>
		<a class="btn" href={resolve('/rezepte')}>Rezepte entdecken</a>
	</p>

	<h2>Häufige Fragen</h2>
	<dl class="faq">
		{#each questions as { question, answer } (question)}
			<div>
				<dt>{question}</dt>
				<dd>{answer}</dd>
			</div>
		{/each}
	</dl>
</article>

<style>
	h1 {
		margin: 0 0 0.75rem;
		font-size: 1.75rem;
		font-weight: 400;
	}
	h2 {
		margin-top: 2rem;
	}
	.lead,
	ul,
	dd {
		line-height: 1.6;
	}
	.lead {
		color: var(--color-text-muted);
	}
	ul {
		padding-left: 1.25rem;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 1.5rem 0 0;
	}
	.faq {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin: 0;
	}
	dt {
		font-weight: 700;
	}
	dd {
		margin: 0.25rem 0 0;
		color: var(--color-text-muted);
	}
</style>
