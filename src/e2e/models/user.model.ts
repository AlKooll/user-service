export const EXPECTED_USER_PROPS = {
  _username: expect.any(String),
  _name: expect.any(String),
  _email: expect.any(String),
  _organization: expect.any(String),
  _bio: expect.any(String),
  _objects: []
};

export const UNEXPECTED_USER_PROPS = {
  _password: expect.anything(),
  password: expect.anything()
};
