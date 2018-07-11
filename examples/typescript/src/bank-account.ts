export class BankAccount {
    public balance: number = 0;

    public deposit(amount: number) {
        this.balance += amount;
    }

    public withdraw(amount: number) {
        this.balance -= amount;
    }
}
