import { MessageDispatcher } from './MessageDispatcher';
import { MessageFetcher } from './MessageFetcher';
import { NotificationManager, NotificationEvent } from './NotificationManager';
import { Message } from './NotificationManager';
import { DataStore } from '../interfaces/DataStore';
import { LearningObject } from '@cyber4all/clark-entity';

export class MessageFacade implements NotificationManager {

  dispatcher: MessageDispatcher;
  fetcher: MessageFetcher;

  constructor(dataStore: DataStore) {
    this.dispatcher = new MessageDispatcher(dataStore);
    this.fetcher = new MessageFetcher(dataStore);
  }

  registerEvent(event: NotificationEvent, object: LearningObject) {
    this.dispatcher.saveMessage({ event, object });
  }
  fetchUnread({ userId }: { userId: any; }): Message[] {
    return this.fetcher.fetchUnread({ userId });
  }
  hasUnread({ userId }: { userId: any; }): boolean {
    return this.fetcher.checkForUnread({ userId });
  }
}
