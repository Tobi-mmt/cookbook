import type { Recipe, Category } from '../../types';
import { categoryColors } from '../colors';

import { potatoSalad } from './potato-salad';
import { tarteFlambee } from './tarte-flambee';
import { spinatFeta } from './spinta-feta';
import { pepperMedaillon } from './pepper-medaillon';
import { chiliConSoja } from './chili-con-soja';
import { pizzaRoll } from './pizza-roll';
import { lentil } from './lentil';
import { spaetzle } from './spaetzle';
import { pizzaDough } from './pizza-dough';
import { sauerbraten } from './sauerbraten';
import { stoveSegetables } from './stove-vegetables';
import { salmonPasta } from './salmon-pasta';
import { veganGravy } from './vegan-gravy';
import { cherryPie } from './cherry-pie';
import { pancake } from './pancake';
import { yeastDumplings } from './yeast-dumplings';
import { rhubarbPie } from './rhubarb-pie';
import { redWinePie } from './red-wine-pie';
import { vanillaCroissant } from './vanilla-croissant';
import { spritzBiscuits } from './spritz-biscuits';
import { nougatBar } from './nougat-bar';
import { cherryPunch } from './cherry-punch';
import { mushroomPan } from './mushroom-pan';
import { dal } from './dal';
import { beanStew } from './bean-stew';
import { persianBeans } from './persian-beans';
import { lentilBroccoliCurry } from './lentil-broccoli-curry';
import { fennelRisotto } from './fennel-risotto';
import { carrotSalad } from './carrot-salad';
import { wildGarlicSoup } from './wild-garlic-soup';
import { bananaBlondies } from './banana-blondies';
import { orecchiettePuttanesca } from './puttanesca';
import { mangoldGorgonzola } from './mangold-gorgonzola';
import { sourBroth } from './sour-broth';
import { mustardDillSauce } from './mustard-dill-sauce';
import { halloumiCurry } from './halloumi-curry';

const unsortedRecipes: Recipe[] = [
	potatoSalad,
	tarteFlambee,
	spinatFeta,
	pepperMedaillon,
	chiliConSoja,
	pizzaRoll,
	lentil,
	spaetzle,
	pizzaDough,
	sauerbraten,
	stoveSegetables,
	salmonPasta,
	veganGravy,
	mushroomPan,
	dal,
	cherryPie,
	pancake,
	yeastDumplings,
	rhubarbPie,
	redWinePie,
	vanillaCroissant,
	spritzBiscuits,
	nougatBar,
	cherryPunch,
	beanStew,
	persianBeans,
	lentilBroccoliCurry,
	fennelRisotto,
	carrotSalad,
	wildGarlicSoup,
	bananaBlondies,
	orecchiettePuttanesca,
	mangoldGorgonzola,
	sourBroth,
	mustardDillSauce,
	halloumiCurry
];

const getCatIndex = (category: Category) => {
	return Object.keys(categoryColors).indexOf(category);
};

export const recipes: Recipe[] = unsortedRecipes
	.sort((a, b) => {
		if (a.title < b.title) {
			return -1;
		}
		if (a.title > b.title) {
			return 1;
		}
		return 0;
	})
	.sort((a, b) => {
		return getCatIndex(a.meta.category) - getCatIndex(b.meta.category);
	});
