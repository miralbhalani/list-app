const DependancyResolver = require('../lib/DependancyResolver');
const hasher = require('../lib/hasher');
const jwt = require('jsonwebtoken');

describe('DependancyResolver', function() {
  let dependancyResolver;

  const dependanciesKey = 'depkey';
  const dependancy = { depSubOb: 'depsubOpvalue' };
  beforeEach(() => {
    dependancyResolver = new DependancyResolver();
    dependancyResolver.addDependancy(dependanciesKey, dependancy);
  });

  test('adds dependancy', () => {
    expect(dependancyResolver.dependancies).toHaveProperty(dependanciesKey, dependancy);
  });

  test('attaches dependancies', () => {
    const mockFunc = jest.fn(dependancies => {
      return dependancies[dependanciesKey];
    });

    const result = dependancyResolver.attach(mockFunc);

    expect(mockFunc).toHaveBeenCalledWith(dependancyResolver.dependancies);
    expect(result).toEqual(dependancy);
  });
});


test('hasher makes correct hash', () => {
  const password = '8949934JKJKDF@#3';
  const passwordHash = '25f558e095c1945703267b7b2eaab0d030347aac21605a6e4c601edca737a110';

  expect(hasher(password)).toBe(passwordHash);
});
