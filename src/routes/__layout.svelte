<script>
	import TopBar from '../components/TopBar.svelte';
</script>

<div>
	<TopBar />
	<main>
		<slot />
	</main>
</div>

<style>
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
		font-family: Helvetica Neue, sans-serif;
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

	main {
		max-width: 1250px;
		margin: auto;
	}

	@media print {
		:global(body) {
			font-size: 12pt;
		}
		main {
			max-width: 2000px;
		}
		:global(a:link:after) {
			content: ' (' attr(href) ') ';
		}
	}
</style>
