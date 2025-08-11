import { Entity } from './entity';

class TestEntity extends Entity {}

describe('Entity', () => {
  it('should create an instance', () => {
    expect(new TestEntity()).toBeTruthy();
  });
});
