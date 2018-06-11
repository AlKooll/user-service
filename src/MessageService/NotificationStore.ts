import { Db, ObjectID } from 'mongodb';
import { NotificationEvent, Notification } from './NotificationManager';

export class NotificationStore {

  constructor(private db: Db) { }

  async pushNotificationToUsers(collection: string, event: NotificationEvent, usernames: string[]) {
    const notification = this.constructNotification(event);
    await this.db
      .collection(collection)
      .updateMany(
        { username: { $in: usernames } },
        { $push: { notification: { ...notification, _id: new ObjectID().toHexString() } } },
        { upsert: true }
      );
  }

  fetchNotifications(collection: string, username: string) {
    return this.db
      .collection(collection)
      .find(
        { username },
        { _id: 0, notifications: 1 }
      ).toArray()
      // Only return the notifications from the projection results
      .then(projection => projection[0].notifications);
  }

  deleteNotification(collection: string, userId: string, notificationsId: string) {
    this.db
      .collection(collection)
      .update(
        { _id: userId },
        { notifications: { $pull: { _id: notificationsId } } }
      );
  }

  /**
   * Constructs a notification based on a NotificationEvent.
   *
   * @private
   * @param {NotificationEvent} event
   * @returns {Notification}
   * @memberof MessageStore
   */
  // TODO: Should this be an actual constructor for a Message class?
  private constructNotification(event: NotificationEvent): Notification {
    return {
      text: event.message.text,
      date: Date.now(),
      link: event.message.link
    };
  }
}
