const { authorize } = require('../middleware/auth');

function invoke(middleware, user) {
  const req = { user };
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  let continued = false;
  middleware(req, res, () => { continued = true; });
  return { res, continued };
}

test('authorization rejects requests without an authenticated user', () => {
  const result = invoke(authorize('Admin'), null);
  expect(result.res.statusCode).toBe(401);
  expect(result.continued).toBe(false);
});

test('authorization rejects authenticated users outside the allowed roles', () => {
  const result = invoke(authorize('Admin', 'FleetManager'), { role: 'Client' });
  expect(result.res.statusCode).toBe(403);
  expect(result.continued).toBe(false);
});

test('authorization allows a user with an explicitly permitted role', () => {
  const result = invoke(authorize('Admin', 'FleetManager'), { role: 'FleetManager' });
  expect(result.res.statusCode).toBe(200);
  expect(result.continued).toBe(true);
});
