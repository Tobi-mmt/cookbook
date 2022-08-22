it('Navigate to recipe detail page', function () {
	cy.visit('/');
	cy.contains("Tobi's");
	cy.contains('Kochbuch');
	cy.contains('Sauerkirschbowle').scrollIntoView();
	cy.get('a').contains('Sauerkirschbowle').click();
	cy.contains('Sauerkirschbowle');
	cy.contains('Sauerkirschen');
	cy.contains('Limonade');
});
