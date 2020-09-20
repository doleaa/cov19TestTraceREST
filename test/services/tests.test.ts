import assert from 'assert';
import app from '../../src/app';

describe('\'tests\' service', () => {
  it('registered the service', () => {
    const service = app.service('tests');

    assert.ok(service, 'Registered the service');
  });
});
