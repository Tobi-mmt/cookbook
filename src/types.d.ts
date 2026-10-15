export interface Category {
	id: number;
	slug: string;
	name: string;
	color: string;
	position: number;
}

export type Ingredient = {
	quantity?: number;
	unit?: string;
	name: string;
	key?: string;
};

export type Section = {
	section: string;
	key?: string;
};

export type NutritionType = 'Vegan' | 'Vegetarisch' | 'Fisch' | 'Fleisch';

/** A person as shown on recipes, null once the account was deleted */
export interface PersonRef {
	username: string;
	name: string;
}

export interface CookbookRef {
	id: string;
	name: string;
	slug: string;
	ownerUsername: string;
}

export interface Recipe {
	id: string;
	meta: {
		portion: number;
		duration: number;
		category: Category;
		nutritionType: NutritionType;
	};
	title: string;
	image: RecipeImage | null;
	/** created within the last weeks, see `src/lib/newRecipe.ts` */
	isNew: boolean;
	description?: string;
	sourceUrl?: string;
	steps: (Step | Section)[];
	ingredients: (Ingredient | Section)[];
	cookbook: CookbookRef;
	author: PersonRef | null;
	updatedAt: Date;
	/** the copy chain, newest first: this recipe was copied from the first entry */
	attribution: { recipeId: string; title: string; author: PersonRef | null; exists: boolean }[];
	/** an unchanged copy points search engines to its original */
	isUnchangedCopy: boolean;
}

export type ImageFormat = 'avif' | 'webp';

export type ImageVariant = { width: number; url: string };

export interface RecipeImage {
	width: number;
	height: number;
	/** tiny base64 data URL used as blurred placeholder */
	placeholder: string;
	variants: Record<ImageFormat, ImageVariant[]>;
}

/** What a recipe tile on the home page shows */
export type RecipeSummary = Pick<Recipe, 'id' | 'title' | 'meta' | 'image' | 'isNew' | 'author'> & {
	cookbookId: string;
};

/** Lightweight recipe data used by the search */
export interface RecipeIndexEntry {
	id: string;
	title: string;
	meta: Recipe['meta'];
	ingredients: { name: string }[];
}

export interface Step {
	description: string;
	linkedIngredients?: Ingredient[];
}
