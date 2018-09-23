import {
  UserInteractor,
  MailerInteractor,
  OTACodeInteractor
} from '../interactors/interactors';
import { BcryptDriver } from '../drivers/BcryptDriver';
import LokiDriver from '../drivers/LokiDriver';
import { MOCK_OBJECTS } from '../../tests/mocks';
const expect = require('chai').expect;
const driver = new LokiDriver() // DataStore
const hasher = new BcryptDriver(3); // Hasher

beforeAll(done => {
  driver.connect('test');
});

describe('searchUsers', () => {
  it('should return an array of users', done => {
    return UserInteractor.searchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY)
      .then(val => {
        expect(val, 'users is not an array!').to.exist;
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return an array of users - password should be undefined when returned!', done => {
    return UserInteractor.searchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY)
      .then(val => {
        expect(val[0].password, 'users is not an array!').to.be.an('undefined');
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return an array of users - accessGroups should be gone when returned!', done => {
    return UserInteractor.searchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY)
      .then(val => {
        if (val[0].hasOwnProperty('accessGroups')) {
          expect.fail();
          done();
        }
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
});

describe('findUser', () => {
  it('should return a user ID', done => {
    return UserInteractor.findUser(driver, MOCK_OBJECTS.USERNAME)
      .then(val => {
        expect(val, 'Expected user was not returned!').to.equal(
          '5a9583401405cb053272ced1'
        );
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return a user - password should be undefined when returned!', done => {
    return UserInteractor.findUser(driver, MOCK_OBJECTS.USERNAME)
      .then(val => {
        expect(val.password, 'user not returned!').to.be.an('undefined');
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return a user - accessGroups should be gone when returned!', done => {
    return UserInteractor.findUser(driver, MOCK_OBJECTS.USERNAME)
      .then(val => {
        if (val.hasOwnProperty('accessGroups')) {
          expect.fail();
          done();
        }
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return an error message', done => {
    // Here we are passing an incorrect parameter for DataStore
    return UserInteractor.findUser(this.driver, MOCK_OBJECTS.USERNAME)
      .then(val => {
        expect.fail();
        done();
      })
      .catch(error => {
        expect(error, 'Expected user was not returned!').to.be.a('string');
        done();
      });
  });
});

describe('verifyEmail', () => {
  it('should return a user', done => {
    return UserInteractor.verifyEmail(driver, MOCK_OBJECTS.EMAIL)
      .then(val => {
        expect(val, 'Expected user was not returned!').to.be.a('object');
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return a user - password should be undefined when returned!', done => {
    return UserInteractor.verifyEmail(driver, MOCK_OBJECTS.EMAIL)
      .then(val => {
        if (val.hasOwnProperty('password')) {
          expect.fail();
        }
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
});

describe('updatePassword', () => {
  it('should return a user', done => {
    return UserInteractor.updatePassword(driver, hasher, MOCK_OBJECTS.EMAIL, MOCK_OBJECTS.PASSWORD)
      .then(val => {
        expect(val, 'Expected user was not returned!').to.be.a('object');
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return a user - password should be undefined when returned!', done => {
    return UserInteractor.updatePassword(driver, hasher, MOCK_OBJECTS.EMAIL, MOCK_OBJECTS.PASSWORD)
      .then(val => {
        expect(val.password, 'user not returned!').to.be.an('undefined');
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return a user - accessGroups should be gone when returned!', done => {
    return UserInteractor.updatePassword(driver, hasher, MOCK_OBJECTS.EMAIL, MOCK_OBJECTS.PASSWORD)
      .then(val => {
        if (val.hasOwnProperty('accessGroups')) {
          expect.fail();
          done();
        }
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
});

describe('identifierInUse', () => {
  it('should return a boolean inUse - true', done => {
    return UserInteractor.identifierInUse(driver, MOCK_OBJECTS.USERNAME)
      .then(val => {
        expect(val.inUse, 'Expected isUse variable was not true').be.true;
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return a boolean inUse - false', done => {
    return UserInteractor.identifierInUse(driver, MOCK_OBJECTS.EMPTY_STRING)
      .then(val => {
        expect(val.inUse, 'Expected isUse variable was not true').be.false;
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
});

afterAll(() => {
  driver.disconnect();
  console.log('Disconnected from database');
});
