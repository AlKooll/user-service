import { UserToken } from '../typings';

export const userId = '123';
export const userToken: UserToken = {
  id: '123',
  name: '',
  username: 'testUser',
  accessGroups: ['admin'],
  emailVerified: true,
  email: '',
  organization: ''
};
export const userRoles = userToken.accessGroups;
