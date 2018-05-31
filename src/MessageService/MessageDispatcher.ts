import { NotificationEvent } from './NotificationManager';
import { DataStore } from '../interfaces/DataStore';
import { LearningObject } from '@cyber4all/clark-entity';

export class MessageDispatcher {

  constructor(private dataStore: DataStore) { }

  async saveMessage({ event, object }: { event: NotificationEvent, object: LearningObject }) {
    const object_id = await this.dataStore.findLearningObject(object.author.username, object.name);
    this.dataStore.addNotification(event, object_id);
  }
}
