import { DataStore } from '../interfaces/interfaces';
import { User } from '@cyber4all/clark-entity';
import { OTACode } from './OTACodeManager';
import { UserQuery } from '../interfaces/Query';
import { MOCK_OBJECTS } from '../tests/mocks';

export default class MockDriver implements DataStore {

  connect(dbURI: string): Promise<void> {
    return Promise.resolve();
  }    

  disconnect(): void {
    return;
  }

  async identifierInUse(username: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  insertUser(user: User): Promise<string> {
    return Promise.resolve(MOCK_OBJECTS.USER_ID);
  }

  async findUser(username: string): Promise<string> {
    return Promise.resolve(MOCK_OBJECTS.USER_ID);
  }

  async loadUser(id: string): Promise<any> {
    return Promise.resolve(MOCK_OBJECTS.USER);
  }

  async editUser(id: string, user: {}): Promise<any> {
    return Promise.resolve(MOCK_OBJECTS.USER);
  }

  deleteUser(id: string): Promise<void> {
    return Promise.resolve();
  }
    
  insertOTACode(otaCode: OTACode): Promise<void> {
    return Promise.resolve();
  }

  async findOTACode(otaCode: string): Promise<string> {
    return Promise.resolve(MOCK_OBJECTS.OTACODE_ID);
  }

  deleteOTACode(id: string): Promise<void> {
    return Promise.resolve();
  }

  searchUsers(
    query: UserQuery
  ): Promise<{ users: any[]; total: number; }> {
    return Promise.resolve({ users: [MOCK_OBJECTS.USER], total: MOCK_OBJECTS.SEARCH_COUNT });
  }

  async findOrganizations(query: string): Promise<any[]> {
    return Promise.resolve([MOCK_OBJECTS.ORGANIZATION]);
  }
}