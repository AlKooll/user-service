import { Assign, Edit, Remove, fetchReviewers, fetchCurators, fetchMembers } from '../collection-role/Interactor';
import MockDriver from '../drivers/MockDriver';
import { COLLECTION_ROLE_MOCK_OBJECTS } from './MocksObjects';
import { MOCK_OBJECTS } from '../tests/mocks';
import { ResourceError } from '../Error';
const driver = new MockDriver();

describe('Assign.start', () => {
  it('allows an admin assign a curator role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).resolves.toBe(undefined);
  });
  it('allows an admin assign a reviewer role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).resolves.toBe(undefined);
  });
  it('allows an admin assign a curator role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_SECJ,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).resolves.toBe(undefined);
  });
  it('allows an admin assign a reviewer role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_SECJ,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).resolves.toBe(undefined);
  });
  it('allows an admin cannot assign curator role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents an admin from assigning a reviewer role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('allows a curator to assign a reviewer role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).resolves.toBe(undefined);
  });
  it('prevents a curator from assigning a curator role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a curator role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a reviewer role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a curator role to a user who is not a member of a different collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a reviewer role to a user who is not a member of a different collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a curator role to a user who is a member of a different collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a reviewer role to a user who is a member of a different collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
  });
});


describe('Edit.start', () => {
  it('admin - can give a curator reviewer access within the same collection', async () => {
    expect.assertions(1);
    await expect(Edit.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).resolves.toBe(undefined);
  });
  it('admin - cannot give a curator reviewer access for a different collection', async () => {
    expect.assertions(1);
    await expect(Edit.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('curator - can give a curator reviewer access within the same collection', async () => {
    expect.assertions(1);
    await expect(Edit.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).resolves.toBe(undefined);
  });
  it('curator - cannot give a curator reviewer access for a different collection', async () => {
    expect.assertions(1);
    await expect(Edit.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
  });
});

describe('Remove.start', () => {
  it('admin - can remove curator role from user', async () => {
    expect.assertions(1);
    await expect(Remove.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).resolves.toBe(undefined);
  });
  it('admin - cannot remove role that does not exist on user', async () => {
    expect.assertions(1);
    await expect(Remove.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('curator - cannot remove curator role from user', async () => {
    expect.assertions(1);
    await expect(Remove.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
});

describe("fetchReviewers", () => {
  it('admin - can fetch all reviewers for a colleciton', async () => {
    expect.assertions(1);
    await expect(fetchReviewers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
    )).resolves.toBeInstanceOf(Array);
  });
  it('curator - can fetch all reviewers for a colleciton', async () => {
    expect.assertions(1);
    await expect(fetchReviewers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
    )).resolves.toBeInstanceOf(Array);
  });
  it('curator - cannot fetch all reviewers for a different colleciton', async () => {
    expect.assertions(1);
    await expect(fetchReviewers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
    )).rejects.toBeInstanceOf(ResourceError);
  });
});

describe("fetchCurators", () => {
  it('admin - can fetch all curators for a colleciton', async () => {
    expect.assertions(1);
    await expect(fetchCurators(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
    )).resolves.toBeInstanceOf(Array);
  });
  it('curator - cannot fetch all cutrators for a colleciton', async () => {
    expect.assertions(1);
    await expect(fetchCurators(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
    )).rejects.toBeInstanceOf(ResourceError);
  });
});

describe("fetchMembers", () => {
  it('admin - can fetch all members for a colleciton', async () => {
    expect.assertions(1);
    await expect(fetchMembers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
    )).resolves.toBeInstanceOf(Array);
  });
  it('curator - cannot fetch all members for a colleciton', async () => {
    expect.assertions(1);
    await expect(fetchMembers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
    )).rejects.toBeInstanceOf(ResourceError);
  });
});
