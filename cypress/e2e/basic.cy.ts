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

it('Jump directly to recipe detail page', function () {
	cy.visit('/recipe/a933602f061a674/Vegane-Bratensoße', { failOnStatusCode: false });
	cy.contains('Vegane Bratensoße');
	cy.contains('Gemüsebrühe');
});
