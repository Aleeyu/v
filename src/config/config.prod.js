import merge from 'webpack-merge'
import baseConfig from '@/config/config.base'

const config = {
  host: 'http://erathink.tunnel.qydev.com',
  baseUrl: 'http://192.168.1.111:8182/vc',
  wechatQrcodeCss: '//erathink.tunnel.qydev.com/static/css/wechat_qrcode.css'
};

export default merge(baseConfig, config);
