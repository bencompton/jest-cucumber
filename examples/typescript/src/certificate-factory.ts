export class CertificateFactory {
    private title = '';
    private lastName = '';
    private score = 0;
    private rank = 'Novice';

    public setReceiver(title: string, name: string, score: string) {
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

    public printCertificate() {
        const pieces = [
            `Certificate of Mastery`,
            `The title of ${this.rank} is hereby awarded to:`,
            `${this.title} ${this.lastName}`,
            `For achieving a score of ${this.score}, ${this.title} ${this.lastName}`,
            `may henceforth use the title ${this.rank}.`,
        ];

        return pieces.join('\n');
    }
}
