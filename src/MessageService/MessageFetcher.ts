import { DataStore } from '../interfaces/DataStore';
import { Notification } from './NotificationManager';

export class MessageFetcher {
  constructor(private dataStore: DataStore) { }

  checkForUnread({ userId }: { userId: string; }): boolean {

    return true;
  }
  fetchUnread({ userId }: { userId: string; }): Notification[] {

    return [{ text: 'My message', date: 9182349816 }];
  }
}
