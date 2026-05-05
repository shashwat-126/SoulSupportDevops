/**
 * Pure unit tests for Joi validators.
 * No DB or network dependencies.
 */

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../src/validators/auth.validator');

const {
  createReviewSchema,
} = require('../src/validators/review.validator');

const {
  createPostSchema,
  createCommentSchema,
  categories,
} = require('../src/validators/forum.validator');

const {
  createSessionSchema,
  updateSessionStatusSchema,
  updateCompletionStatusSchema,
} = require('../src/validators/session.validator');

describe('auth.validator - registerSchema', () => {
  const valid = {
    email: 'foo@example.com',
    password: 'longenough1',
    fullName: 'Foo Bar',
    userType: 'user',
  };

  it('accepts a valid payload', () => {
    const { error } = registerSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('rejects an invalid email', () => {
    const { error } = registerSchema.validate({ ...valid, email: 'not-an-email' });
    expect(error).toBeDefined();
  });

  it('rejects passwords shorter than 8 characters', () => {
    const { error } = registerSchema.validate({ ...valid, password: 'short' });
    expect(error).toBeDefined();
  });

  it('rejects unknown user types', () => {
    const { error } = registerSchema.validate({ ...valid, userType: 'wizard' });
    expect(error).toBeDefined();
  });

  it('allows therapist with optional bio', () => {
    const { error } = registerSchema.validate({ ...valid, userType: 'therapist', bio: 'Hello' });
    expect(error).toBeUndefined();
  });
});

describe('auth.validator - loginSchema', () => {
  it('requires email and password', () => {
    const { error } = loginSchema.validate({});
    expect(error).toBeDefined();
  });

  it('accepts well-formed credentials', () => {
    const { error } = loginSchema.validate({ email: 'a@b.co', password: 'secret' });
    expect(error).toBeUndefined();
  });
});

describe('auth.validator - password reset schemas', () => {
  it('requires email for forgot password', () => {
    expect(forgotPasswordSchema.validate({}).error).toBeDefined();
    expect(forgotPasswordSchema.validate({ email: 'a@b.co' }).error).toBeUndefined();
  });

  it('requires token and minimum-length newPassword for reset', () => {
    expect(resetPasswordSchema.validate({ token: 't' }).error).toBeDefined();
    expect(resetPasswordSchema.validate({ token: 't', newPassword: 'short' }).error).toBeDefined();
    expect(resetPasswordSchema.validate({ token: 't', newPassword: 'longenough1' }).error).toBeUndefined();
  });
});

describe('review.validator - createReviewSchema', () => {
  it('requires sessionId and rating in 1..5', () => {
    expect(createReviewSchema.validate({}).error).toBeDefined();
    expect(createReviewSchema.validate({ sessionId: 'x', rating: 0 }).error).toBeDefined();
    expect(createReviewSchema.validate({ sessionId: 'x', rating: 6 }).error).toBeDefined();
    expect(createReviewSchema.validate({ sessionId: 'x', rating: 5 }).error).toBeUndefined();
  });

  it('allows optional comment / reviewTitle', () => {
    const { error } = createReviewSchema.validate({
      sessionId: 'x',
      rating: 4,
      comment: 'Good session',
      reviewTitle: 'Loved it',
    });
    expect(error).toBeUndefined();
  });
});

describe('forum.validator', () => {
  it('exposes the canonical category list', () => {
    expect(categories).toEqual(
      expect.arrayContaining(['general', 'anxiety', 'depression', 'relationships', 'stress', 'success'])
    );
  });

  it('rejects content shorter than 10 chars', () => {
    const { error } = createPostSchema.validate({ content: 'short', category: 'general' });
    expect(error).toBeDefined();
  });

  it('rejects unknown category', () => {
    const { error } = createPostSchema.validate({
      content: 'This is a long enough post body',
      category: 'unknown',
    });
    expect(error).toBeDefined();
  });

  it('defaults isAnonymous to true', () => {
    const { value, error } = createPostSchema.validate({
      content: 'This is a long enough post body',
      category: 'general',
    });
    expect(error).toBeUndefined();
    expect(value.isAnonymous).toBe(true);
  });

  it('requires non-empty comment content', () => {
    expect(createCommentSchema.validate({ content: '' }).error).toBeDefined();
    expect(createCommentSchema.validate({ content: 'hi' }).error).toBeUndefined();
  });
});

describe('session.validator', () => {
  it('rejects past sessionDate when creating a session', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error } = createSessionSchema.validate({
      therapistId: 'abc',
      sessionDate: past,
      durationMinutes: 60,
    });
    expect(error).toBeDefined();
  });

  it('accepts future sessionDate with allowed duration', () => {
    const future = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { error, value } = createSessionSchema.validate({
      therapistId: 'abc',
      sessionDate: future,
    });
    expect(error).toBeUndefined();
    expect(value.durationMinutes).toBe(60); // default
  });

  it('rejects unsupported durationMinutes values', () => {
    const future = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { error } = createSessionSchema.validate({
      therapistId: 'abc',
      sessionDate: future,
      durationMinutes: 45,
    });
    expect(error).toBeDefined();
  });

  it('requires cancelReason when therapist cancels', () => {
    expect(
      updateSessionStatusSchema.validate({ status: 'cancelled_by_therapist' }).error
    ).toBeDefined();

    expect(
      updateSessionStatusSchema.validate({
        status: 'cancelled_by_therapist',
        cancelReason: 'Schedule conflict',
      }).error
    ).toBeUndefined();
  });

  it('updateCompletionStatusSchema accepts allowed statuses', () => {
    expect(updateCompletionStatusSchema.validate({ status: 'completed' }).error).toBeUndefined();
    expect(updateCompletionStatusSchema.validate({ status: 'cancelled_by_user' }).error).toBeUndefined();
    expect(updateCompletionStatusSchema.validate({ status: 'invalid' }).error).toBeDefined();
  });
});
