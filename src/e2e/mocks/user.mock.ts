import { User } from '@cyber4all/clark-entity';
const testUserData = {
  name: 'Test User',
  username: 'testuser',
  email: 'testuser@test.com',
  organization: 'CLARK Test Suite',
  password: 'test123',
  bio: ''
};

export const testUser = new User(
  testUserData.username,
  testUserData.name,
  testUserData.email,
  testUserData.organization,
  testUserData.organization
);
