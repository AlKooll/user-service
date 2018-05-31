import { DataStore } from '../interfaces/DataStore';
import { Message } from './NotificationManager';

export class MessageFetcher {
  constructor(private dataStore: DataStore) { }

  checkForUnread({ userId }: { userId: string; }): boolean {

    return true;
  }
  fetchUnread({ userId }: { userId: string; }): Message[] {

    return [{ text: 'My message', date: 9182349816 }];
  }
}
