<script lang="ts">
	import { page } from '$app/state';
	import type { Usage } from '#lib/server/costs.js';
	import { SITE_NAME } from '#lib/site.js';

	let {
		data
	}: {
		data: {
			usage: Usage;
			limits: { databaseBytes: number; blobBytes: number; freeMailsPerMonth: number };
		};
	} = $props();

	const { usage, limits } = $derived(data);

	const megabytes = (bytes: number) =>
		`${(bytes / 1024 / 1024).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB`;
	const euros = (value: number) =>
		value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

	const DOMAIN_PER_YEAR = 16;
	const BACKUPS_PER_MONTH = 0.1;
	const perMonth = $derived(DOMAIN_PER_YEAR / 12 + BACKUPS_PER_MONTH);

	type Meter = { label: string; used: number; limit: number; text: string };
	type Service = {
		name: string;
		purpose: string;
		plan: string;
		cost: string;
		limits: string[];
		meters: Meter[];
		growth: string;
	};

	const services = $derived<Service[]>([
		{
			name: 'Vercel',
			purpose: 'Betrieb der Anwendung und Speicher für die Rezeptbilder',
			plan: 'Hobby',
			cost: 'kostenlos',
			limits: [
				'1 GB Speicher für Bilder',
				'100 GB Datenübertragung im Monat',
				'1 Million Aufrufe der Anwendung und 4 Stunden Rechenzeit im Monat'
			],
			meters:
				usage.blobBytes === null
					? []
					: [
							{
								label: 'Speicher für Bilder',
								used: usage.blobBytes,
								limit: limits.blobBytes,
								text: `${megabytes(usage.blobBytes)} von 1 GB`
							}
						],
			growth:
				'Der Hobby-Tarif ist nur für nicht kommerzielle Projekte. Reichen die Limits nicht mehr, kostet der Pro-Tarif 20 $ im Monat.'
		},
		{
			name: 'Neon',
			purpose: 'Datenbank mit allen Konten, Kochbüchern und Rezepten',
			plan: 'Free',
			cost: 'kostenlos',
			limits: ['1 GB Speicher', '100 Stunden Rechenzeit im Monat'],
			meters: [
				{
					label: 'Größe der Datenbank',
					used: usage.databaseBytes,
					limit: limits.databaseBytes,
					text: `${megabytes(usage.databaseBytes)} von 1 GB`
				}
			],
			growth:
				'Darüber wird nach Verbrauch abgerechnet: 0,35 $ pro GB und Monat und 0,106 $ pro Stunde Rechenzeit.'
		},
		{
			name: 'Scaleway Transactional Email',
			purpose: 'Anmelde-Links, Einladungen und andere Mails',
			plan: 'nach Verbrauch',
			cost: 'kostenlos bis 300 Mails im Monat',
			limits: ['300 Mails im Monat ohne Kosten'],
			meters: [
				{
					label: 'Mails in diesem Monat',
					used: usage.mailsThisMonth,
					limit: limits.freeMailsPerMonth,
					text: `${usage.mailsThisMonth.toLocaleString('de-DE')} von 300`
				}
			],
			growth: 'Je weitere 1.000 Mails kosten 0,25 €.'
		},
		{
			name: 'Scaleway Object Storage',
			purpose: 'Verschlüsselte Backups von Datenbank und Bildern',
			plan: 'nach Verbrauch',
			cost: `ca. ${euros(BACKUPS_PER_MONTH)} im Monat`,
			limits: ['kein festes Limit'],
			meters: [],
			growth:
				'Die Kosten wachsen mit der Größe der Backups, bei wenigen Gigabyte bleiben es Cent-Beträge.'
		},
		{
			name: 'Domain kochbuchbande.de',
			purpose: 'Die Adresse der Seite, registriert bei Scaleway',
			plan: 'jährlich',
			cost: `${euros(DOMAIN_PER_YEAR)} im Jahr`,
			limits: [],
			meters: [],
			growth: 'Bleibt gleich, egal wie groß die Seite wird.'
		},
		{
			name: 'Bugsink',
			purpose: 'Fehlerberichte, damit Fehler schnell auffallen',
			plan: 'Free',
			cost: 'kostenlos',
			limits: ['15.000 Fehlerberichte im Monat'],
			meters: [],
			growth: 'Der nächste Tarif kostet 16 € im Monat für 75.000 Fehlerberichte.'
		},
		{
			name: 'GitHub',
			purpose: 'Programmcode und die nächtlichen Backup-Läufe',
			plan: 'öffentliches Repository',
			cost: 'kostenlos',
			limits: [],
			meters: [],
			growth: 'Für öffentliche Projekte bleibt das kostenlos.'
		}
	]);

	const measuredAt = $derived(
		new Intl.DateTimeFormat('de-DE', {
			dateStyle: 'long',
			timeStyle: 'short',
			timeZone: 'Europe/Berlin'
		}).format(new Date(usage.measuredAt))
	);
	const description = `Die ${SITE_NAME} ist für alle kostenlos. Hier steht offen, was ihr Betrieb kostet, welche Dienste sie nutzt und wo deren Grenzen liegen.`;
</script>

<svelte:head>
	<title>Betriebskosten - {SITE_NAME}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="{page.url.origin}/kosten" />
</svelte:head>

<article class="page">
	<h1>Was der Betrieb der {SITE_NAME} kostet</h1>
	<p class="lead">
		<strong>Für dich ist die {SITE_NAME} kostenlos</strong>, ohne Abo, ohne Werbung und ohne
		versteckte Kosten. Der Betrieb kostet trotzdem etwas, und das zahle ich als Betreiber aus
		eigener Tasche. Hier steht offen, welche Dienste die {SITE_NAME} nutzt, was sie kosten und wo die
		kostenlosen Grenzen liegen. Die Arbeitszeit ist nicht eingerechnet.
	</p>

	<div class="total">
		<strong>{euros(perMonth)}</strong>
		<span>im Monat für den Betreiber, also rund {euros(perMonth * 12)} im Jahr</span>
	</div>

	<p class="hint">
		Gerade gibt es {usage.recipes.toLocaleString('de-DE')} Rezepte in {usage.cookbooks.toLocaleString(
			'de-DE'
		)}
		Kochbüchern von {usage.accounts.toLocaleString('de-DE')} Personen. Die Nutzung unten ist vom {measuredAt}
		und wird stündlich aktualisiert. Datenübertragung, Rechenzeit und Fehlerberichte zeigen nur die Konten
		bei den Anbietern, deshalb steht dort nur die Grenze.
	</p>

	<div class="services">
		{#each services as service (service.name)}
			<section class="service">
				<header>
					<h2>{service.name}</h2>
					<span class="cost">{service.cost}</span>
				</header>
				<p>{service.purpose}. <span class="plan">Tarif: {service.plan}</span></p>
				{#each service.meters as meter (meter.label)}
					<div class="meter">
						<div class="meter-label">
							<span>{meter.label}</span>
							<span>{meter.text}</span>
						</div>
						<div
							class="bar"
							role="meter"
							aria-label={meter.label}
							aria-valuemin={0}
							aria-valuemax={meter.limit}
							aria-valuenow={meter.used}
						>
							<span style="width: {Math.min(100, (meter.used / meter.limit) * 100)}%"></span>
						</div>
					</div>
				{/each}
				{#if service.limits.length}
					<ul>
						{#each service.limits as limit (limit)}<li>{limit}</li>{/each}
					</ul>
				{/if}
				<p class="growth">{service.growth}</p>
			</section>
		{/each}
	</div>

	<p class="hint">
		Stand der Preise und Limits: Oktober 2026, laut den Preisseiten der Anbieter. Steigen die Kosten
		einmal deutlich, steht das hier.
	</p>
</article>

<style>
	h1 {
		margin: 0 0 0.75rem;
		font-size: 1.75rem;
		font-weight: 400;
	}
	.lead {
		line-height: 1.6;
		color: var(--color-text-muted);
	}
	.lead strong {
		color: var(--color-text);
	}
	.total {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		margin: 1.5rem 0 0.75rem;
	}
	.total strong {
		font-size: 2.25rem;
		font-weight: 400;
		letter-spacing: -0.02em;
	}
	.total span {
		color: var(--color-text-muted);
	}
	.services {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 1.5rem 0;
	}
	.service {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 1rem 1.25rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.25rem 1rem;
	}
	h2 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 700;
	}
	.cost {
		font-size: 0.9375rem;
	}
	.service p,
	ul {
		margin: 0;
		line-height: 1.5;
	}
	.plan,
	.growth,
	ul {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
	ul {
		padding-left: 1.25rem;
	}
	.meter-label {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.3rem;
		font-size: 0.875rem;
	}
	.bar {
		height: 0.5rem;
		overflow: hidden;
		background: var(--color-surface-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--color-dark);
	}
</style>
