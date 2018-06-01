import { Responder } from '../interfaces/Responder';
import { DataStore } from '../interfaces/DataStore';
import { NotificationType, NotificationEvent } from './NotificationManager';

export function sendMessageToSubscribers(
  dataStore: DataStore,
  responder: Responder,
  usernames: string[],
  authorUsername: string,
  learningObjectName: string
) {
  const event = constructEvent(NotificationType.AUTHOR_UPDATED_OBJECT, authorUsername, learningObjectName);

  dataStore.addNotification(event, usernames)
    .then(() => {
      responder.sendOperationSuccess();
    })
    .catch((error) => {
      console.log(error);
      responder.sendOperationError('Failure to add message.', 500);
    });
}
export function sendMessageToAuthor(
  dataStore: DataStore,
  responder: Responder,
  authorUsername: string,
  learningObjectName: string
) {
  const event = constructEvent(NotificationType.USER_SAVED_OBJECT, authorUsername, learningObjectName);

}
function constructEvent(type: NotificationType, username: string, learningObjectName: string): NotificationEvent {
  return {
    type,
    message: {
      text: `${learningObjectName} was updated.`,
      link: buildLink(type, username, learningObjectName)
    }
  };
}

function buildLink(type: NotificationType, username: string, learningObjectName: string) {
  switch (type) {
    case NotificationType.AUTHOR_UPDATED_OBJECT:
      return `/details/${username}/${learningObjectName}`;
    case NotificationType.USER_SAVED_OBJECT:
      return undefined;
  }
}

export async function fetchMessages(dataStore: DataStore, userId: string) {
  dataStore.fetchMessages(userId);
}

export async function deleteMessage(dataStore: DataStore, userId: string, messageId: string) {
  dataStore.deleteMessage(userId, messageId);
}
