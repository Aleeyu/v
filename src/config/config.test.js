import merge from 'webpack-merge'
import baseConfig from '@/config/config.base'

const config = {
  host: 'http://bhtest.51s.co',
  baseUrl: 'http://bhtest.51s.co/vc',
  wechat: {
    appId: 'wxb9c796bd30f0f732',        // 螺霸霸来啦
    customerAppId: 'wxb9c796bd30f0f732' // 螺霸霸来啦
  }
};

export default merge(baseConfig, config);
