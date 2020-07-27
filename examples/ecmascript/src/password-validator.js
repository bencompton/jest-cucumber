export class PasswordValidator {
    setPassword(password) {
        this.password = password;
    }

    validatePassword(claimedPassword) {
        return this.password === claimedPassword;
    }
}
