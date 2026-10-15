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
	steps: (Step | Section)[];
	ingredients: (Ingredient | Section)[];
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
export type RecipeSummary = Pick<Recipe, 'id' | 'title' | 'meta' | 'image' | 'isNew'>;

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
