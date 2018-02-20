const itemPrices = {
    'Autographed Neil deGrasse Tyson book': 100,
    'Rick Astley t-shirt': 22,
    'An idea to replace EVERYTHING with blockchains': 0
};

export class OnlineSales {
    constructor() {
        this.listedItems = [];
    }

    listItem(name) {
        this.listedItems.push(name);
    }

    sellItem(name) {
        const itemIndex = this.listedItems.indexOf(name);

        if (itemIndex !== -1) {
            this.listedItems.splice(itemIndex, 1);

            return itemPrices[name];
        } else {
            return null;
        }
    }
}