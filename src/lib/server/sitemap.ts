import { and, desc, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { slugerize } from '../slugerize';
import type { Database } from './db/client';
import { cookbooks, recipes, users } from './db/schema';
import { isVisible } from './recipes';

export const URLS_PER_SITEMAP = 5000;
const INDEXING_DELAY = 14 * 24 * 60 * 60 * 1000;

/**
 * Everything search engines may index: visible content of accounts that are older than two weeks,
 * only cookbooks with recipes.
 */
export const listSitemapPaths = async (db: Database, now = new Date()) => {
	const indexable = and(
		eq(users.banned, false),
		lt(users.createdAt, new Date(now.getTime() - INDEXING_DELAY))
	);
	const recipeCount = sql<number>`(select count(*)::int from ${recipes} where ${recipes.cookbookId} = ${cookbooks.id} and ${recipes.deletedAt} is null and ${recipes.hiddenAt} is null)`;

	const [recipeRows, cookbookRows] = await Promise.all([
		db
			.select({ id: recipes.id, title: recipes.title, updatedAt: recipes.updatedAt })
			.from(recipes)
			.innerJoin(cookbooks, eq(cookbooks.id, recipes.cookbookId))
			.innerJoin(users, eq(users.id, cookbooks.ownerId))
			.where(and(isVisible, indexable))
			.orderBy(desc(recipes.updatedAt)),
		db
			.select({ slug: cookbooks.slug, owner: users.username })
			.from(cookbooks)
			.innerJoin(users, eq(users.id, cookbooks.ownerId))
			.where(
				and(isNull(cookbooks.deletedAt), isNull(cookbooks.hiddenAt), indexable, gt(recipeCount, 0))
			)
	]);
	const owners = [...new Set(cookbookRows.map(({ owner }) => owner))];

	return [
		{ path: '/' },
		...owners.map((owner) => ({ path: `/@${owner}` })),
		...cookbookRows.map(({ owner, slug }) => ({ path: `/@${owner}/${slug}` })),
		...recipeRows.map(({ id, title, updatedAt }) => ({
			path: `/rezept/${id}/${slugerize(title)}`,
			lastmod: updatedAt.toISOString().slice(0, 10)
		}))
	];
};

const escapeXml = (text: string) => text.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);

export const sitemapIndex = (origin: string, count: number) =>
	`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: count }, (_, page) => `\t<sitemap><loc>${origin}/sitemap/${page}.xml</loc></sitemap>`).join('\n')}
</sitemapindex>`;

export const sitemapPage = (origin: string, entries: { path: string; lastmod?: string }[]) =>
	`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		({ path, lastmod }) =>
			`\t<url><loc>${escapeXml(origin + path)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>`;
