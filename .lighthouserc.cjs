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
				'csp-xss': 'warn'
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
