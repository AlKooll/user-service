import { User } from '@cyber4all/clark-entity';

export class AuthUser extends User {
  private _password: string;
  get password(): string {
    return this._password;
  }
  set password(password: string) {
    this._password = password;
  }
  private _accessGroups: string[];
  get accessGroups(): string[] {
    return this._accessGroups;
  }
  set accessGroups(accessGroups: string[]) {
    this._accessGroups = accessGroups;
  }
  constructor(user: Partial<AuthUser>) {
    const username = user.username ? user.username.toLowerCase().trim() : '';
    super({ ...(user as Partial<User>), username });
    this._password = user.password || '';
    this._accessGroups = user.accessGroups || [];
  }
  toPlainObject(): Partial<AuthUser> {
    return { ...super.toPlainObject(), accessGroups: this.accessGroups };
  }
}
