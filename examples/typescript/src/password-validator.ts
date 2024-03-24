export class PasswordValidator {
  private password: string | null = null;

  public setPassword(password: string) {
    this.password = password;
  }

  public validatePassword(claimedPassword: string) {
    return this.password === claimedPassword;
  }
}
