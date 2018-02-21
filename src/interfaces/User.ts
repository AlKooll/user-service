import {
    LearningObject
} from '@cyber4all/clark-entity';

export interface User {
    _username: string;
    _name: string;
    _email: string;
    _organization: string;
    _pwd: string;
    _objects: LearningObject[];
}