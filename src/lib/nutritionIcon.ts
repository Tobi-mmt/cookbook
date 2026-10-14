import type { Component } from 'svelte';
import Beef from '@lucide/svelte/icons/beef';
import Carrot from '@lucide/svelte/icons/carrot';
import Leaf from '@lucide/svelte/icons/leaf';
import type { NutritionType } from '../types';

export const nutritionIcons: Record<NutritionType, Component> = {
	Vegan: Leaf,
	Vegetarisch: Carrot,
	Fleisch: Beef
};
