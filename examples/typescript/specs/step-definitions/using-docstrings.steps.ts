import { defineFeature, loadFeature } from '../../../../src/';
import { CertificateFactory } from '../../src/certificate-factory';

const feature = loadFeature('./examples/typescript/specs/features/using-docstrings.feature');

defineFeature(feature, (test) => {
    let certificateFactory: CertificateFactory;
    let certificate: string | null;

    beforeEach(() => {
        certificateFactory = new CertificateFactory();
    });

    test('Print a certificate', ({ given, when, then }) => {
        given(/^(.*) (.*) has achieved a ([0-9]*)$/, (title, lastName, score) => {
            certificateFactory.setReceiver(title, lastName, score);
        });

        when(/^I print the certificate$/, () => {
            certificate = certificateFactory.printCertificate();
        });

        then(/^It prints$/, (expectedCertificate) => {
            expect(certificate).toBe(expectedCertificate);
        });
    });
});
