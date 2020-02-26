export class CertificateFactory {
    constructor() {
        this.title = '';
        this.lastName = '';
        this.score = 0;
        this.rank = 'Novice';
    }

    setReceiver(title, name, score) {
        this.title = title;
        this.lastName = name;
        this.score = Number.parseInt(score, 10);
        if (this.score > 2700) {
            this.rank = 'Super Grandmaster';
        } else if (this.score > 2500) {
            this.rank = 'Grandmaster';
        } else if (this.score > 2000) {
            this.rank = 'Expert';
        }
    }

    printCertificate() {
        const pieces = [
            'Certificate of Mastery',
            `The title of ${this.rank} is hereby awarded to:`,
            `${this.title} ${this.lastName}`,
            `For achieving a score of ${this.score}`,
        ];

        return pieces.join('\n');
    }
}