it('Navigate to recipe detail page', function () {
	cy.visit('/');
	cy.contains('Unser');
	cy.contains('Kochbuch');
	cy.contains('Sauerkirschbowle').scrollIntoView();
	cy.get('a').contains('Sauerkirschbowle').click();
	cy.contains('Sauerkirschbowle');
	cy.contains('Sauerkirschen');
	cy.contains('Limonade');
});

it('Protects the admin area', function () {
	cy.visit('/admin');
	cy.location('pathname').should('eq', '/admin/login');
	cy.get('input[type=password]').should('exist');
});
