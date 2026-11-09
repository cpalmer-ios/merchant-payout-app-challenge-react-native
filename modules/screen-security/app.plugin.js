const { withInfoPlist } = require('expo/config-plugins');

const FACE_ID_USAGE = 'Authenticate with Face ID to approve payouts over 1,000.00.';

function withScreenSecurity(config) {
  return withInfoPlist(config, (mod) => {
    if (!mod.modResults.NSFaceIDUsageDescription) {
      mod.modResults.NSFaceIDUsageDescription = FACE_ID_USAGE;
    }
    return mod;
  });
}

module.exports = withScreenSecurity;
