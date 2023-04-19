module.exports = {
	ci: {
		collect: {
			url: [
				process.env.PREVIEW_URL,
				process.env.PREVIEW_URL + '/recipe/a933602f061a674/Vegane-Bratensoße'
			]
		},
		assert: {
			preset: 'lighthouse:no-pwa',
			assertions: {
				'bf-cache': 'warn',
				'is-crawlable': 'warn',
				'categories:performance': ['warn', { minScore: 0.9 }],
				'categories:accessibility': ['error', { minScore: 1 }],
				'categories:seo': ['warn', { minScore: 0.9 }]
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
