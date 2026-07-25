module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
  'node_modules/(?!(react-native|@react-native|react-native-device-info|react-native-track-player|react-native-keychain)/)',
],
  moduleNameMapper: {
    '^@env$': '<rootDir>/__mocks__/@env.js',
    '^@/common/(.*)$': '<rootDir>/../common/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};