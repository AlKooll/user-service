import { DataStore } from '../interfaces/DataStore';
import { LearningObject } from '@cyber4all/clark-entity';

export interface NotificationManager {
  registerEvent(event: NotificationEvent, object: LearningObject): void;
  fetchUnread({ userId }: { userId: any; }): Message[];
  hasUnread({ userId }: { userId: any; }): boolean;
}

export enum NotificationType {
  AUTHOR_UPDATED_OBJECT,
  USER_SAVED_OBJECT,
}

export interface NotificationEvent {
  type: NotificationType;
  message: {
    text: string;
    link?: string;
  };
}

export interface Message {
  text: string;
  date: number;
  link?: string;
}
