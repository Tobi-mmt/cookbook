import type { IconName, NutritionType } from '../types';

export const getIconName = (nutritionType: NutritionType): IconName => {
	if (nutritionType === 'Vegan') return 'leaf';
	if (nutritionType === 'Fleisch') return 'steak';
	if (nutritionType === 'Vegetarisch') return 'leaf';
};
