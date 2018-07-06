export const EXPECTED_TOKEN_PROPS = {
  username: expect.any(String),
  name: expect.any(String),
  email: expect.any(String),
  organization: expect.any(String),
  emailVerified: expect.any(Boolean),
  iat: expect.any(Number),
  exp: expect.any(Number),
  aud: expect.any(String),
  iss: expect.any(String)
};

export const UNEXPECTED_TOKEN_PROPS = {
  _password: expect.anything(),
  password: expect.anything()
};
