-- The recipes were imported from the former recipe files on 2026-10-01, so they all got that day as
-- created_at. This sets the date of the commit that first added each recipe. The recipes were traced
-- back through all file layouts (lib/recipe.js, lib/recipes.js, lib/recipes/*.js and
-- src/lib/recipes/*), following renamed files and titles.
-- Only moves dates back, so a recipe created later in the admin area is never touched.
UPDATE "recipes" AS r
SET "created_at" = v.created_at::timestamptz
FROM (VALUES
	('dad8a5cc03bf3e2', '2020-04-10T19:09:52+02:00'), -- Kartoffelsalat: c0e0bca feat: Add basic recipe components
	('8ac4d9df5b4a7ce', '2020-04-10T19:09:52+02:00'), -- Flammkuchen: c0e0bca feat: Add basic recipe components
	('c0af6df3a5a0ba5', '2020-04-10T23:35:51+02:00'), -- Kirschkuchen mit Streuseln: 8c55e1e feat: Add many recipes
	('29102fad633dc89', '2020-04-10T23:35:51+02:00'), -- Chili con Soja: 8c55e1e feat: Add many recipes
	('04f8d4ebbe949b0', '2020-04-10T23:35:51+02:00'), -- Linsen: 8c55e1e feat: Add many recipes
	('d4ebaa7d1705a3c', '2020-04-10T23:35:51+02:00'), -- Pfannkuchen: 8c55e1e feat: Add many recipes
	('6cf38a4ae10cb73', '2020-04-10T23:35:51+02:00'), -- Medaillons in Pfefferrahmsoße: 8c55e1e feat: Add many recipes
	('f30a3b728e281c9', '2020-04-10T23:35:51+02:00'), -- Pizzateig: 8c55e1e feat: Add many recipes
	('483c5d4d2907b24', '2020-04-10T23:35:51+02:00'), -- Pizzabrötchen: 8c55e1e feat: Add many recipes
	('0cbe988fb13f1ce', '2020-04-10T23:35:51+02:00'), -- Rhabarberkuchen: 8c55e1e feat: Add many recipes
	('619c1e18f0760d4', '2020-04-10T23:35:51+02:00'), -- Spätzle: 8c55e1e feat: Add many recipes
	('967ac074bbc3d06', '2020-04-10T23:35:51+02:00'), -- Blätterteig mit Spinat & Feta: 8c55e1e feat: Add many recipes
	('b14415790b6dd2d', '2020-04-10T23:35:51+02:00'), -- Dampfnudeln: 8c55e1e feat: Add many recipes
	('6e6f6aac7a64ac9', '2020-04-11T13:40:31+02:00'), -- Sauerbraten: cf715b6 feat(recipe): Add sauerbraten
	('a2da9168f15465a', '2020-04-11T14:47:11+02:00'), -- Rotweinkuchen: 2c7fb4d feat(recipe): Add rotweinkuchen
	('a1222bbc43739e7', '2020-04-18T19:01:54+02:00'), -- Sauerkirschbowle: eabb4b6 feat(recipe): Add sauerkirschbowle
	('8919f04870dcb2c', '2020-04-27T23:45:06+02:00'), -- Ofengemüse in Rotweinmarinade: a4a4211 feat(recipe): Add ofengemuesse
	('fffbe78941911d4', '2020-07-18T15:56:26+02:00'), -- Lachsnudeln: a06a71d recipe: Add Lachsnudeln
	('c3b6c8cfc0a9eb0', '2020-12-02T01:19:39+01:00'), -- Vanillekipferl: 3510a07 recipe: Add Vanilkipferl
	('6d2781ecd5f402d', '2020-12-02T01:39:46+01:00'), -- Spritzgebäck: 58b85ba recipe: Add Spritzgebaeck
	('7dc870e4888223c', '2020-12-02T01:58:11+01:00'), -- Nougatstangen: e991eb1 recipe: Add Nougatstangen
	('a933602f061a674', '2021-01-02T16:49:41+01:00'), -- Vegane Bratensoße: 89fc0e6 recipe: Add Bratensosse
	('73dfd163f27192a', '2021-04-11T15:34:53+02:00'), -- Pilzschmorpfanne: 48d612e feat(recipe): Add pilzschmorpfanne
	('9abdc64367c7ef9', '2021-04-16T13:13:49+02:00'), -- Dal: e44af19 recipe: Add dal
	('77832c8e46d83fa', '2022-01-25T22:21:30+01:00'), -- Bohneneintopf mit veganem Speck: 2129fe5 recipe: vegan bean stew
	('2115eaceef5309b', '2022-03-20T14:49:47+01:00'), -- Persische Bohnenpfanne: 371b18e recipe: Add persian beans
	('1ff1f1079687389', '2022-03-20T15:15:30+01:00'), -- Linsencurry mit Brokkoli und Karotten: 77595f2 recipe: Add lentil-broccoli-curry
	('09048473dbc1072', '2022-03-20T15:39:12+01:00'), -- Risotto mit Fenchel und Champignons: 3750e98 recipe: Add fennel-risotto
	('c36ffe8815a8fbc', '2022-05-30T14:54:05+02:00'), -- Karottensalat: 0b25921 recipe: Add carrot-salad
	('6c2a40def9f5197', '2023-04-10T00:04:53+02:00'), -- Bärlauchsuppe: 5e4017f recipe: add wild garlic soup
	('810574f4c02aba7', '2023-06-15T12:32:54+02:00'), -- Bananen Blondies: 8fad51d recipe: add banana blondies
	('3dce3daa69c965e', '2023-06-21T13:27:32+02:00'), -- Orecchiette Puttanesca: 5d6499c recipe: add puttanesca
	('c1008eceaa8ae55', '2023-08-28T08:49:53+02:00'), -- Mangold Gorgonzola Pasta: 0808972 recipe: add mangold-gorgonzola pasta
	('eb060a5a4557feb', '2023-08-30T21:07:52+02:00'), -- Saure Brühe: 6144b2e recipe: add sour broth
	('978ae850d6a8a7a', '2024-07-28T14:24:04+02:00'), -- Senf-Dill-Sauce: daa7830 recipe: add mustardDillSauce
	('1f333d968583846', '2024-07-28T15:07:47+02:00'), -- Halloumi Curry: de58051 recipe: add halloumiCurry
	('0b57e94daf130eb', '2024-09-30T13:08:44+02:00'), -- Lauchsuppe: 813ec0c recipe: add leek soup
	('59fe90dafd44a91', '2025-04-12T18:23:52+02:00'), -- Pad Thai: b28af10 recipe: add pad thai
	('9bccab94789af4a', '2025-05-19T20:40:30+02:00'), -- Harissa-Bohnen-Eintopf: d85c780 feat(recipes): add harissa beans recipe (#938)
	('4c68f83111df518', '2025-12-22T14:54:10+01:00'), -- Schokoladencheesecake: c432b3a feat(recipe): add choco cheesecake recipe and update image path
	('8042e928b7ce5d2', '2026-01-01T16:03:29+01:00'), -- Energie-Kugeln: 00c2ef0 recipe: add enery balls
	('7e07b43e779d747', '2026-02-24T21:13:54+01:00'), -- Gyoza-Auflauf: 75a6456 feat(rezipe): add gyoza casserole
	('5854d02a26167fb', '2026-05-10T16:36:03+02:00') -- Crispy Reis Salat: 6095ddf recipe: add crispy rice salad
) AS v(id, created_at)
WHERE r.id = v.id AND r.created_at > v.created_at::timestamptz;
