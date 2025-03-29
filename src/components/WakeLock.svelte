<script>
	import { onDestroy } from 'svelte';

	let wakeLock = null;
	let isActive = false;

	async function toggleWakeLock() {
		if (isActive) {
			await requestWakeLock();
		} else {
			releaseWakeLock();
		}
	}

	async function requestWakeLock() {
		if ('wakeLock' in navigator) {
			try {
				wakeLock = await navigator.wakeLock.request('screen');
				wakeLock.addEventListener('release', () => {
					wakeLock = null;
					isActive = false;
				});
			} catch (err) {
				console.error('Wake Lock error:', err);
				isActive = false;
			}
		} else {
			console.warn('Wake Lock API not supported');
			isActive = false;
		}
	}

	function releaseWakeLock() {
		if (wakeLock) {
			wakeLock.release();
			wakeLock = null;
		}
	}

	onDestroy(() => {
		releaseWakeLock();
	});
</script>

<div class="switch-wrapper">
	<label class="switch">
		<input type="checkbox" bind:checked={isActive} on:change={toggleWakeLock} />
		<span class="slider"></span>
		<div class="label-text-wrapper">
			<span class="label-text">Kochmodus</span>
			<span class="label-text-description">Bildschirm dauerhaft aktiv</span>
		</div>
	</label>
</div>

<style>
	.switch-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.switch {
		position: relative;
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
		background-color: #ccc;
		transition: 0.4s;
		border-radius: 34px;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: 0.4s;
		border-radius: 50%;
	}

	input:checked + .slider {
		background-color: var(--highlight-color);
	}

	input:checked + .slider:before {
		transform: translateX(26px);
	}

	.label-text-wrapper {
		display: flex;
		margin-left: 0.5em;
		flex-direction: column;
		align-items: flex-start;
	}

	.label-text {
		vertical-align: middle;
	}

	.label-text-description {
		font-size: 0.7em;
		opacity: 0.7;
		vertical-align: middle;
	}
</style>
