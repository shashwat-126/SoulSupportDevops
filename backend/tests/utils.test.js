/**
 * Unit tests for backend utilities.
 * These tests have no DB or network dependencies.
 */

const ApiError = require('../src/utils/ApiError');
const ApiResponse = require('../src/utils/ApiResponse');
const asyncHandler = require('../src/utils/asyncHandler');
const { getPaginationMetadata } = require('../src/utils/helpers');

describe('ApiError', () => {
  it('sets statusCode and message and marks as operational', () => {
    const err = new ApiError(404, 'Not found');
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.isOperational).toBe(true);
    expect(typeof err.stack).toBe('string');
  });
});

describe('ApiResponse', () => {
  it('marks success true for 2xx codes', () => {
    const r = new ApiResponse(200, { foo: 'bar' }, 'ok');
    expect(r.success).toBe(true);
    expect(r.statusCode).toBe(200);
    expect(r.message).toBe('ok');
    expect(r.data).toEqual({ foo: 'bar' });
  });

  it('marks success false for 4xx/5xx codes', () => {
    const r = new ApiResponse(400, null, 'bad');
    expect(r.success).toBe(false);
  });

  it('exposes wrapped object fields at the top level for backward compatibility', () => {
    const r = new ApiResponse(200, { user: { id: '1' }, token: 'abc' });
    expect(r.user).toEqual({ id: '1' });
    expect(r.token).toBe('abc');
    // wrapped form must still be present
    expect(r.data.user).toEqual({ id: '1' });
    expect(r.data.token).toBe('abc');
  });

  it('does not overwrite reserved keys (success, statusCode, message, data)', () => {
    const r = new ApiResponse(200, { success: 'nope', statusCode: 999, message: 'no', data: 'no' }, 'real');
    expect(r.success).toBe(true);
    expect(r.statusCode).toBe(200);
    expect(r.message).toBe('real');
    // data is the wrapped object, not the inner "data" key
    expect(r.data).toEqual({ success: 'nope', statusCode: 999, message: 'no', data: 'no' });
  });

  it('handles array data without exploding into top-level keys', () => {
    const r = new ApiResponse(200, [1, 2, 3]);
    expect(r.data).toEqual([1, 2, 3]);
    expect(r['0']).toBeUndefined();
  });

  it('handles null data without throwing', () => {
    const r = new ApiResponse(200, null, 'ok');
    expect(r.data).toBeNull();
    expect(r.success).toBe(true);
  });
});

describe('asyncHandler', () => {
  it('forwards thrown errors to next()', async () => {
    const next = jest.fn();
    const error = new Error('boom');
    const handler = asyncHandler(async () => {
      throw error;
    });
    await handler({}, {}, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next() on success', async () => {
    const next = jest.fn();
    const handler = asyncHandler(async (req, res) => {
      res.sent = true;
    });
    const res = {};
    await handler({}, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sent).toBe(true);
  });
});

describe('getPaginationMetadata', () => {
  it('computes pagination correctly for middle page', () => {
    const meta = getPaginationMetadata(2, 10, 35);
    expect(meta).toEqual({
      page: 2,
      limit: 10,
      total: 35,
      pages: 4,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('reports no next page when on last page', () => {
    const meta = getPaginationMetadata(4, 10, 35);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(true);
  });

  it('reports no prev page on first page', () => {
    const meta = getPaginationMetadata(1, 10, 35);
    expect(meta.hasPrev).toBe(false);
    expect(meta.hasNext).toBe(true);
  });

  it('handles empty result set', () => {
    const meta = getPaginationMetadata(1, 10, 0);
    expect(meta.pages).toBe(0);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(false);
  });
});
