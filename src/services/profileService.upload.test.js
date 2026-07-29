import test from 'node:test';
import assert from 'node:assert/strict';
import { extractUploadKey, normalizeUploadKey } from './uploadResponse.js';

test('extractUploadKey prefers the storage key when upload response also contains a URL', () => {
  const response = {
    data: {
      data: {
        url: 'http://localhost:8081/uploads/user/identity/user-id/card.jpg',
        key: 'user/identity/user-id/card.jpg',
        size: 1234,
      },
    },
  };

  assert.equal(extractUploadKey(response), 'user/identity/user-id/card.jpg');
});

test('normalizeUploadKey migrates a previously stored local upload URL back to its key', () => {
  assert.equal(
    normalizeUploadKey(
      'http://localhost:8081/uploads/user/identity/user-id/card.jpg'
    ),
    'user/identity/user-id/card.jpg'
  );
});
