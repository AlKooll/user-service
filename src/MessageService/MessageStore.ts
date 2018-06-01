import { Db, ObjectID } from 'mongodb';
import { NotificationEvent, Message } from './NotificationManager';

export class MessageStore {
  constructor(private db: Db) { }

  async pushMessageToUsers(collection: string, event: NotificationEvent, usernames: string[]) {
    const message = this.constructMessage(event);
    await this.db
      .collection(collection)
      .updateMany(
        { username: { $in: usernames } },
        { $push: { messages: { ...message, _id: new ObjectID().toHexString() } } },
        { upsert: true }
      );
  }

  fetchMessages(collection: string, userId: string) {
    return this.db
      .collection(collection)
      .find(
        { _id: userId },
        { _id: 0, messages: 1 }
      ).toArray();
  }

  deleteMessage(collection: string, userId: string, messageId: string) {
    this.db
      .collection(collection)
      .update(
        { _id: userId },
        { messages: { $pull: { _id: messageId } } }
      );
  }

  /**
   * Constructs a Message based on a NotificationEvent.
   *
   * @private
   * @param {NotificationEvent} event
   * @returns {Message}
   * @memberof MessageStore
   */
  // TODO: Should this be an actual constructor for a Message class?
  private constructMessage(event: NotificationEvent): Message {
    return {
      text: event.message.text,
      date: Date.now(),
      link: event.message.link
    };
  }
}
