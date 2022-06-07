it('Find Bratensoße on page', function () {
	cy.visit('/');
	cy.contains("Tobi's");
	cy.contains('Kochbuch');
	cy.contains('Vegane Bratensoße');
});
