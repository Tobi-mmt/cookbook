<script>
	import TopBar from '$components/TopBar.svelte';
	import { PUBLIC_UMAMI_WEBSITE_ID } from '$env/static/public';
</script>

<svelte:head>
	<script
		defer
		src="https://cloud.umami.is/script.js"
		data-website-id={PUBLIC_UMAMI_WEBSITE_ID}
	></script>
</svelte:head>

<div>
	<TopBar />
	<main>
		<slot />
	</main>
</div>

<style>
	/* roboto-100 - latin */
	@font-face {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 100;
		src:
			local(''),
			url('/fonts/roboto/roboto-v29-latin-100.woff2') format('woff2'),
			/* Chrome 26+, Opera 23+, Firefox 39+ */ url('/fonts/roboto/roboto-v29-latin-100.woff')
				format('woff');
		/* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
		font-display: swap;
	}

	/* roboto-regular - latin */
	@font-face {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 400;
		src:
			local(''),
			url('/fonts/roboto/roboto-v29-latin-regular.woff2') format('woff2'),
			/* Chrome 26+, Opera 23+, Firefox 39+ */ url('/fonts/roboto/roboto-v29-latin-regular.woff')
				format('woff');
		/* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
		font-display: swap;
	}

	/* roboto-700 - latin */
	@font-face {
		font-family: 'Roboto';
		font-style: normal;
		font-weight: 700;
		src:
			local(''),
			url('/fonts/roboto/roboto-v29-latin-700.woff2') format('woff2'),
			/* Chrome 26+, Opera 23+, Firefox 39+ */ url('/fonts/roboto/roboto-v29-latin-700.woff')
				format('woff');
		/* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
		font-display: swap;
	}

	:root {
		--category-salat: '#57B16B';
		--category-hearty: '#DD5D58';
		--category-dessert: '#8882A8';
		--category-drinks: '#F0CD5B';
	}

	:global(html, body) {
		font-size: 16px;
		padding: 0;
		margin: 0;
		font-family: Roboto, sans-serif;
		color: #333;
	}
	:global(p) {
		margin: 0.5em 0;
	}

	:global(*) {
		box-sizing: border-box;
	}
	@media only screen and (max-width: 800px) {
		:global(html, body) {
			font-size: 18px;
		}
	}

	@media print {
		:global(body) {
			font-size: 12pt;
		}
		:global(a:link:after) {
			content: ' (' attr(href) ') ';
		}
	}
</style>
