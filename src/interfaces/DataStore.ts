import { User } from '@cyber4all/clark-entity';
import { OTACode } from '../drivers/OTACodeManager';
import { NotificationEvent, Message } from '../MessageService/NotificationManager';
import { fetchMessages, deleteMessage } from '../MessageService/MessageInteractor';

export interface DataStore {
  connect(dbURI: string): Promise<void>;
  disconnect(): void;
  identifierInUse(username: string): Promise<boolean>;
  insertUser(user: User): Promise<string>;
  findUser(username: string): Promise<string>;
  loadUser(id: string): Promise<User>;
  editUser(id: string, user: {}): Promise<User>;
  deleteUser(id: string): Promise<void>;
  insertOTACode(otaCode: OTACode): Promise<void>;
  findOTACode(otaCode: string): Promise<string>;
  deleteOTACode(id: string): Promise<void>;
  searchUsers(query: {}): Promise<User[]>;
  /**
   * Adds a notification for all user's who have saved the learning object involved in the event.
   *
   * @param {NotificationEvent} event The event triggering the notification
   * @param {string} id The unique identifier for the learning object involved in the event
   * @returns {Promise<void>}
   * @memberof DataStore
   */
  addNotification(event: NotificationEvent, usernames: string[]): Promise<void>;
  /**
   * Fetches all messages for a user.
   *
   * @param {string} userId The unique identifier for the user.
   * @memberof DataStore
   */
  fetchMessages(userId: string): Promise<Message[]>;
  /**
   * Deletes a message from the user.
   *
   * @param {string} messageId The unique identifier for the message to be deleted.
   * @memberof DataStore
   */
  deleteMessage(userId: string, messageId: string): Promise<void>;
}
