it('Navigates from a cookbook to a recipe', function () {
	cy.visit('/@tobi/unser-kochbuch');
	cy.contains('Unser Kochbuch');
	cy.contains('Sauerkirschbowle').scrollIntoView();
	cy.get('a').contains('Sauerkirschbowle').click();
	cy.location('pathname').should('match', /^\/rezept\//);
	cy.contains('Sauerkirschen');
	cy.contains('Limonade');
});

it('Redirects old recipe links and plain usernames', function () {
	cy.request({ url: '/recipe/a1222bbc43739e7/Sauerkirschbowle', followRedirect: false })
		.its('status')
		.should('eq', 301);
	cy.visit('/tobi');
	cy.location('pathname').should('eq', '/@tobi');
});

it('Asks to sign in for the admin area', function () {
	cy.visit('/admin');
	cy.location('pathname').should('eq', '/anmelden');
	cy.get('input[type=email]').should('exist');
});
