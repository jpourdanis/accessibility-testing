const { assert } = require("chai");
const lighthouse = require("lighthouse");
const puppeteer = require('puppeteer');
const Table = require("cli-table");
const {URL} = require('url');

const config = require("./config.json");

const table = new Table();

// Define your test url.
const testUrl = "https://the-internet.herokuapp.com/large";

function launchChromeAndRunLighthouse(url, opts, conf = null) {
  return puppeteer
    .launch({ 
      headless: false,
      executablePath: '<your-path-to-chrome>',
      chromeFlags: opts.chromeFlags })
    .then((brower) => {
      opts.port = (new URL(brower.wsEndpoint())).port;
      return lighthouse(url, opts, conf).then((res) =>
        /** use results.lhr for the JS-consumeable output
         * use results.report for the HTML/JSON/CSV output as a string
         * use results.artifacts for the trace/screenshots/other specific case you need (rarer)
         * https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
         */
         brower.close().then(() => res.lhr)
      );
    });
}

const opts = {
  chromeFlags: ["--disable-gpu", "--show-paint-rects", "--ignore-certificate-errors", "--no-sandbox", "--disable-dev-shm-usage" , "--disable-setuid-sandbox"],
};

describe("Lighthouse Testing", function () {
  let results;
  // Timeout doesn't need to be same. It can be more or less depending on your project.
  this.timeout(50000);
  before("run base test", (done) => {
    launchChromeAndRunLighthouse(testUrl, opts, config).then((res) => {
      results = Object.keys(res.categories).reduce((merged, category) => {
        merged[category] = res.categories[category].score;
        return merged;
      }, {});
      done();
    });
  });

  it("should have accessibility score greater than 80", (done) => { 
    assert.equal(results.accessibility > 0.8, true);
    done();
  });

  after(() => {
    Object.keys(results).forEach((category) => {
      table.push([category, Math.round(results[category] * 100)]);
    });
    // Output lighthouse scores in a table format within the cli.
    console.log(table.toString());
  });
});
