import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '#lib/server/context.js';
import { cookbooks, recipes } from '#lib/server/db/schema.js';
import { notAnUnchangedCopy } from '#lib/server/home.js';
import { listLandings } from '#lib/server/landings.js';
import { isVisible } from '#lib/server/recipes.js';
import { indexableOwner } from '#lib/server/indexing.js';
import { landingPath } from '#lib/landings.js';
import { SITE_NAME, SITE_TAGLINE } from '#lib/site.js';

export const config = { isr: { expiration: 86400 } };

const RECIPES = 200;

/** A guide to the site for AI assistants, see https://llmstxt.org */
export async function GET({ url }) {
	const db = getDb();
	const [landings, newest] = await Promise.all([
		listLandings(db),
		db
			.select({ id: recipes.id, title: recipes.title })
			.from(recipes)
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.where(and(isVisible, indexableOwner(), notAnUnchangedCopy))
			.orderBy(desc(recipes.updatedAt))
			.limit(RECIPES)
	]);
	const link = (path: string) => new URL(path, url.origin).href;

	const text = `# ${SITE_NAME}

> ${SITE_NAME} (${url.host}) ist eine deutschsprachige Plattform für Kochbücher: ${SITE_TAGLINE}. Menschen speichern ihre Rezepte, importieren Rezepte aus Links, pflegen Kochbücher gemeinsam mit Familie und Freunden und übernehmen Rezepte anderer in ihr eigenes Kochbuch. Kostenlos, ohne Werbung, nicht kommerziell.

Alle Rezepte, Kochbücher und Profile sind öffentlich und stehen unter der Lizenz CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Bei Weiterverwendung bitte die Person nennen, die das Rezept eingestellt hat, und auf das Rezept verlinken.

Jedes Rezept gibt es auch als Markdown: \`${url.origin}/rezept/<id>.md\`. Rezeptseiten enthalten außerdem schema.org-Daten (Recipe) als JSON-LD.

## Über die Plattform

- [Über die ${SITE_NAME}](${link('/ueber')}): was man hier tun kann, häufige Fragen
- [Rezepte nach Kategorie](${link('/rezepte')})
- [Suche](${link('/suche')}): Volltextsuche über Titel und Zutaten, z. B. ${link('/suche?q=Linsen')}

## Kategorien

${landings.map(({ slug, title, count }) => `- [${title}](${link(landingPath(slug))}): ${count} Rezepte`).join('\n')}

## Neueste Rezepte

${newest.map(({ id, title }) => `- [${title}](${link(`/rezept/${id}.md`)})`).join('\n')}

## Optional

- [Sitemap](${link('/sitemap.xml')}): alle öffentlichen Rezepte, Kochbücher und Profile
- [Nutzungsbedingungen](${link('/nutzungsbedingungen')})
`;
	return new Response(text, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
