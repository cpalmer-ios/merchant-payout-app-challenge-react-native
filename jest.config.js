process.env.TZ = 'UTC';

module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-ng/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tanstack/.*|screen-security|msw|until-async|@mswjs/.*|@open-draft/.*|rettime|strict-event-emitter|headers-polyfill|outvariant)',
  ],
  moduleNameMapper: {
    // msw marks its Node entry as unavailable under the react-native export
    // condition, which is what jest-expo resolves. Point tests at the real build.
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/mocks/server.test.ts'],
  setupFiles: ['<rootDir>/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
