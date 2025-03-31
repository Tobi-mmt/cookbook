<script lang="ts">
	import type { IconName } from '$types';
	export let style = '';
	export let name: IconName;
</script>

<i {style} class={`icofont-${name}`}></i>

<style>
	/*! 
* @package IcoFont 
* @version 1.0.1 
* @author IcoFont https://icofont.com 
* @copyright Copyright (c) 2015 - 2021 IcoFont 
* @license - https://icofont.com/license/
*/
	@font-face {
		font-family: 'IcoFont';
		font-weight: normal;
		font-style: 'Regular';
		src:
			url('/fonts/iconfont/icofont.woff2') format('woff2'),
			url('/fonts/iconfont/icofont.woff') format('woff');
		font-display: swap;
	}

	[class^='icofont-'],
	[class*=' icofont-'] {
		font-family: 'IcoFont' !important;
		font-style: normal;
		font-weight: normal;
		font-variant: normal;
		text-transform: none;
		white-space: nowrap;
		word-wrap: normal;
		direction: ltr;
		line-height: 1;
		/* Better Font Rendering =========== */
		-webkit-font-smoothing: antialiased;
	}

	.icofont-navigation-menu:before {
		content: '\efa2';
	}

	.icofont-minus:before {
		content: '\ef9a';
	}

	.icofont-plus:before {
		content: '\efc2';
	}

	.icofont-users-social:before {
		content: '\ed0c';
	}

	.icofont-users-alt-6:before {
		content: '\ed0b';
	}

	.icofont-sand-clock:before {
		content: '\e819';
	}

	.icofont-leaf:before {
		content: '\ef5e';
	}

	.icofont-steak:before {
		content: '\eb93';
	}

	.icofont-spoon-and-fork:before {
		content: '\eb92';
	}

	.icofont-filter:before {
		content: '\ef29';
	}

	.icofont-close:before {
		content: '\eee4';
	}

	.icofont-search:before {
		content: '\ed1b';
	}
</style>
