export type Category = 'Salat' | 'Herzhaft' | 'Süßspeise' | 'Getränke';

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

export type NutritionType = 'Vegan' | 'Vegetarisch' | 'Fleisch';

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

/** Lightweight recipe data used by the menu and the search */
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

export type IconName =
	| 'navigation-menu'
	| 'minus'
	| 'plus'
	| 'users-social'
	| 'users-alt-6'
	| 'sand-clock'
	| 'leaf'
	| 'steak'
	| 'spoon-and-fork'
	| 'filter'
	| 'close'
	| 'search';
