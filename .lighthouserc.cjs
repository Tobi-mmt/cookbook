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
				'categories:performance': ['error', { minScore: 0.9 }],
				'categories:accessibility': ['error', { minScore: 1 }],
				'categories:seo': ['error', { minScore: 0.9 }],
				'total-byte-weight': ['error', { maxNumericValue: 1000 * 1024 }] // 1 MB
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
