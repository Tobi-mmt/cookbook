export type Category = 'Salat' | 'Herzhaft' | 'Süßspeise' | 'Getränke';

export type Ingredient = {
	quantity?: number;
	unit?: string;
	name: string;
};

export type Section = {
	section: string;
};

export type NutritionType = 'Vegan' | 'Vegetarisch' | 'Fleisch';

export interface Recipe {
	meta: {
		portion: number;
		duration: number;
		category: Category;
		nutritionType: NutritionType;
	};
	title: string;
	image: string;
	description: string[];
	ingredients: (Ingredient | Section)[];
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
	| 'close';
