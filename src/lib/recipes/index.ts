import type { Recipe, Category } from '../../types';
import { categoryColors } from '../colors';

import { potatoSalad } from './potato-salad/recipe';
import { tarteFlambee } from './tarte-flambee/recipe';
import { spinatFeta } from './spinta-feta/recipe';
import { pepperMedaillon } from './pepper-medaillon/recipe';
import { chiliConSoja } from './chili-con-soja/recipe';
import { pizzaRoll } from './pizza-roll/recipe';
import { lentil } from './lentil/recipe';
import { spaetzle } from './spaetzle/recipe';
import { pizzaDough } from './pizza-dough/recipe';
import { sauerbraten } from './sauerbraten/recipe';
import { stoveSegetables } from './stove-vegetables/recipe';
import { salmonPasta } from './salmon-pasta/recipe';
import { veganGravy } from './vegan-gravy/recipe';
import { cherryPie } from './cherry-pie/recipe';
import { pancake } from './pancake/recipe';
import { yeastDumplings } from './yeast-dumplings/recipe';
import { rhubarbPie } from './rhubarb-pie/recipe';
import { redWinePie } from './red-wine-pie/recipe';
import { vanillaCroissant } from './vanilla-croissant/recipe';
import { spritzBiscuits } from './spritz-biscuits/recipe';
import { nougatBar } from './nougat-bar/recipe';
import { cherryPunch } from './cherry-punch/recipe';
import { mushroomPan } from './mushroom-pan/recipe';
import { dal } from './dal/recipe';
import { beanStew } from './bean-stew/recipe';
import { persianBeans } from './persian-beans/recipe';
import { lentilBroccoliCurry } from './lentil-broccoli-curry/recipe';
import { fennelRisotto } from './fennel-risotto/recipe';
import { carrotSalad } from './carrot-salad/recipe';
import { wildGarlicSoup } from './wild-garlic-soup/recipe';
import { bananaBlondies } from './banana-blondies/recipe';
import { orecchiettePuttanesca } from './puttanesca/recipe';
import { mangoldGorgonzola } from './mangold-gorgonzola/recipe';
import { sourBroth } from './sour-broth/recipe';
import { mustardDillSauce } from './mustard-dill-sauce/recipe';
import { halloumiCurry } from './halloumi-curry/recipe';
import { leekSoup } from './leek-soup/recipe';
import { padThai } from './pad-thai/recipe';
import { harissaBeans } from './harissa-beans/recipe';
import { chocoScheescake } from './choco-scheescake/recipe';

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
	halloumiCurry,
	leekSoup,
	padThai,
	harissaBeans,
	chocoScheescake
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
