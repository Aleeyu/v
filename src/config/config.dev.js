import merge from 'webpack-merge'
import baseConfig from '@/config/config.base'

const config = {
  host: 'http://bhtest.51s.co',
  baseUrl: 'http://bhtest.51s.co/vc'
};

export default merge(baseConfig, config);
