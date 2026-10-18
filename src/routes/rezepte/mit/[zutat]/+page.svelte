<script lang="ts">
	import LandingPage from '#components/LandingPage.svelte';

	let { data } = $props();
</script>

<LandingPage landing={data.landing} others={data.others} ingredients={data.ingredients} />
