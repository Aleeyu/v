import devConfig from '@/config/config.dev'
import prodConfig from '@/config/config.prod'
import testConfig from '@/config/config.test'
import testLocalConfig from '@/config/config.testLocal'

let config;
/* global process */
if (process.env.NODE_ENV === 'production' && process.argv_length === 2) {
  config = prodConfig;
} else if (process.env.NODE_ENV === 'production' && process.argv_length === 4) {
  /* special for testBuild */
  config = testConfig;
} else if (process.env.NODE_ENV === 'production' && process.argv_length === 5) {
  config = testLocalConfig;
} else {
  config = devConfig;
}

export default config;
