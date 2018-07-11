const itemPrices: { [itemName: string]: number } = {
    'Autographed Neil deGrasse Tyson book': 100,
    'Rick Astley t-shirt': 22,
    'An idea to replace EVERYTHING with blockchains': 0,
};

export class OnlineSales {
    private listedItems: string[] = [];

    public listItem(name: string) {
        this.listedItems.push(name);
    }

    public sellItem(name: string) {
        const itemIndex = this.listedItems.indexOf(name);

        if (itemIndex !== -1) {
            this.listedItems.splice(itemIndex, 1);

            return itemPrices[name];
        } else {
            return null;
        }
    }
}
