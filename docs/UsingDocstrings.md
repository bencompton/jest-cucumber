# Using Docstrings

```gherkin
Feature: Certificate manufacturing

Scenario Outline: Print a certificate
  Given <Title> <LastName> has achieved a <Score>
  When I print the certificate
  Then It prints
    """
    Certificate of Mastery
    The title of <Rank> is hereby awarded to:
    <Title> <LastName>
    For achieving a score of <Score>, <Title> <LastName>
    may henceforth use the title <Rank>.
    """

  Examples:

  | Title | LastName  | Score | Rank              |
  | Mr.   | Vega      | 1000  | Novice            |
  | Mrs.  | Wallace   | 2001  | Expert            |
  | Mr.   | Winnfield | 2550  | Grandmaster       |
  | Ms.   | Bunny     | 2800  | Super Grandmaster |
```

```javascript
import { defineFeature, loadFeature } from "jest-cucumber";
import { CertificateFactory } from "../../src/certificate-factory";

const feature = loadFeature("./specs/features/using-docstrings.feature");

defineFeature(feature, test => {
  let certificateFactory;
  let certificate;

  beforeEach(() => {
    certificateFactory = new CertificateFactory();
  });

  test("Print a certificate", ({ given, when, then }) => {
    given(/^(.*) (.*) has achieved a ([0-9]*)$/, (title, lastName, score) => {
      certificateFactory.setReceiver(title, lastName, score);
    });

    when(/^I print the certificate$/, () => {
      certificate = certificateFactory.printCertificate();
    });

    then(/^It prints$/, expectedCertificate => {
      expect(certificate).toBe(expectedCertificate);
    });
  });
});
```
