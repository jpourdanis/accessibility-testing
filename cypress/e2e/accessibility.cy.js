/// <reference types="cypress" />

describe("The App", () => {
  it("meets accessibility standards", () => {
    const thresholds = {
      accessibility: 100,
    };

    // https://github.com/GoogleChrome/lighthouse/blob/main/docs/emulation.md
    // const lighthouseConfig = {
    //   formFactor: 'desktop',
    //   screenEmulation: { disabled: true },
    // };
    cy.visit("https://the-internet.herokuapp.com/large");
    cy.lighthouse(thresholds);
  });
});
