/**
 * Pure unit tests for backend middleware.
 * No DB or network dependencies.
 */

const validate = require('../src/middlewares/validate.middleware');
const { mongoSanitizeCompat } = require('../src/middlewares/mongoSanitize.middleware');
const { sanitizePlainText, sanitizeFields } = require('../src/middlewares/sanitize.middleware');
const { loginSchema, registerSchema } = require('../src/validators/auth.validator');
const ApiError = require('../src/utils/ApiError');

describe('validate middleware', () => {
  it('passes through valid bodies and replaces req.body with sanitized value', () => {
    const middleware = validate(loginSchema);
    const req = { body: { email: 'a@b.co', password: 'whatever' } };
    const next = jest.fn();
    middleware(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.body.email).toBe('a@b.co');
  });

  it('strips unknown fields', () => {
    const middleware = validate(loginSchema);
    const req = { body: { email: 'a@b.co', password: 'pw', extra: 'should-be-removed' } };
    middleware(req, {}, jest.fn());
    expect(req.body).not.toHaveProperty('extra');
  });

  it('throws ApiError(400) on invalid body', () => {
    const middleware = validate(registerSchema);
    const req = { body: { email: 'not-an-email', password: 'short', fullName: '', userType: 'wizard' } };
    expect(() => middleware(req, {}, jest.fn())).toThrow(ApiError);
    try {
      middleware(req, {}, jest.fn());
    } catch (err) {
      expect(err.statusCode).toBe(400);
      expect(typeof err.message).toBe('string');
    }
  });
});

describe('mongoSanitizeCompat middleware', () => {
  it('removes $ prefixed keys from body, params, query', () => {
    const req = {
      body: { $where: 'evil', email: 'a@b.co', nested: { $gt: 1, ok: true } },
      params: { $set: 'nope' },
      query: { 'a.b': 'dotted', clean: 'yes' },
    };
    const next = jest.fn();
    mongoSanitizeCompat(req, {}, next);

    expect(req.body).not.toHaveProperty('$where');
    expect(req.body.email).toBe('a@b.co');
    expect(req.body.nested).not.toHaveProperty('$gt');
    expect(req.body.nested.ok).toBe(true);
    expect(req.params).not.toHaveProperty('$set');
    expect(req.query).not.toHaveProperty('a.b');
    expect(req.query.clean).toBe('yes');
    expect(next).toHaveBeenCalled();
  });

  it('handles arrays without crashing', () => {
    const req = {
      body: { tags: [{ $or: 'evil', name: 'safe' }, 'plain'] },
      params: {},
      query: {},
    };
    mongoSanitizeCompat(req, {}, jest.fn());
    expect(req.body.tags[0]).not.toHaveProperty('$or');
    expect(req.body.tags[0].name).toBe('safe');
    expect(req.body.tags[1]).toBe('plain');
  });
});

describe('sanitize middleware', () => {
  it('strips all html tags from strings', () => {
    expect(sanitizePlainText('<script>alert(1)</script>hi')).toBe('hi');
    expect(sanitizePlainText('<b>bold</b> normal')).toBe('bold normal');
  });

  it('returns non-string values unchanged', () => {
    expect(sanitizePlainText(42)).toBe(42);
    expect(sanitizePlainText(null)).toBe(null);
    expect(sanitizePlainText(undefined)).toBe(undefined);
  });

  it('sanitizeFields middleware sanitizes only the listed body fields', () => {
    const middleware = sanitizeFields('content', 'bio');
    const req = {
      body: {
        content: '<p>hello</p>',
        bio: '<script>x</script>I am bio',
        title: '<b>untouched</b>',
      },
    };
    const next = jest.fn();
    middleware(req, {}, next);
    expect(req.body.content).toBe('hello');
    expect(req.body.bio).toBe('I am bio');
    // title was not in the field list, so it remains unchanged
    expect(req.body.title).toBe('<b>untouched</b>');
    expect(next).toHaveBeenCalled();
  });

  it('skips missing fields without crashing', () => {
    const middleware = sanitizeFields('content');
    const req = { body: {} };
    expect(() => middleware(req, {}, jest.fn())).not.toThrow();
  });
});
