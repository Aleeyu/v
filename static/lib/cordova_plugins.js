cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "phonegap-plugin-barcodescanner.BarcodeScanner",
      "file": "plugins/phonegap-plugin-barcodescanner/www/barcodescanner.js",
      "pluginId": "phonegap-plugin-barcodescanner",
      "clobbers": [
        "cordova.plugins.barcodeScanner"
      ]
    },
    {
      "id": "ionic-plugin-keyboard.keyboard",
      "file": "plugins/ionic-plugin-keyboard/www/android/keyboard.js",
      "pluginId": "ionic-plugin-keyboard",
      "clobbers": [
        "cordova.plugins.Keyboard"
      ],
      "runs": true
    }
  ];
  module.exports.metadata =
// TOP OF METADATA
    {
      "cordova-plugin-whitelist": "1.3.2",
      "cordova-plugin-compat": "1.0.0",
      "phonegap-plugin-barcodescanner": "6.0.8",
      "ionic-plugin-keyboard": "2.2.1"
    };
// BOTTOM OF METADATA
});
