/**
 * Created by Yatagaras on 2017/7/14.
 * 用于封装一些常用的调用方法
 */

export default {
  install (Vue) {
    String.prototype.format = function (args) {
      let result = this;
      if (arguments.length > 0) {
        if (arguments.length === 1 && typeof (args) === 'object') {
          for (let key in args) {
            if (args[key] !== undefined) {
              let reg = new RegExp('({' + key + '})', 'g');
              result = result.replace(reg, args[key] === null ? '' : String(args[key]));
            }
          }
        } else {
          for (let i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined) {
              let reg = new RegExp('({)' + i + '(})', 'g');
              result = result.replace(reg, arguments[i] === null ? '' : String(arguments[i]));
            }
          }
        }
      }
      return result;
    }

    Date.prototype.format = function (fmt = 'yyyy/MM/dd hh:mm:ss') {
      let o = {
        'M+': this.getMonth() + 1,                 // 月份
        'd+': this.getDate(),                    // 日
        'h+': this.getHours(),                   // 小时
        'm+': this.getMinutes(),                 // 分
        's+': this.getSeconds(),                 // 秒
        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
        'S': this.getMilliseconds()             // 毫秒
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        }
      }
      return fmt
    }

    Vue.prototype.$Cookie = {
      set: function (name, value, num, interval) {
        /* eslint-disable no-new */
        let d = new Date()
        let base = 1000
        switch (interval) {
          case 'ms':
            base = 1
            break
          case 's':
            base = 1000
            break
          case 'm':
            base = 1000 * 60
            break
          case 'h':
            base = 1000 * 60 * 60
            break
          case 'd':
            base = 1000 * 60 * 60 * 24
            break;
        }

        interval || (interval = 's')
        num || (num = 1)
        d.setTime(d.getTime() + base * num)
        window.document.cookie = name + '=' + value + ';path=/;expires=' + d.toGMTString()
      },
      get: function (name) {
        let v = window.document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)')
        return v ? v[2] : null
      },
      delete: function (name) {
        this.set(name, '', -1)
      }
    }

    Vue.prototype.$uuid = function (connectChar) {
      connectChar = connectChar == null ? '-' : connectChar;
      let d = new Date().getTime();
      let _uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });
      return connectChar === '-' ? _uuid : _uuid.replace(/-/ig, connectChar);
    }

    Vue.prototype.$PageToken = function (obj) {
      if (Vue.prototype.$isPlainObject(obj)) {
        let token = String(Vue.prototype.$SHA265(JSON.stringify(obj)))
        window.localStorage.setItem('pt', token)
        return Object.assign({}, obj, {
          token: token
        })
      } else {
        return obj
      }
    }

    Vue.prototype.$String = {
      getParameter: function (str, key) {
        let re = new RegExp(key + '=([^&]*)(?:&)?')
        return str.match(re) && str.match(re)[1]
      }
    }

    Vue.prototype.$isArray = function (o, strict = false) {
      let isarray = Object.prototype.toString.call(o) === '[object Array]'
      return isarray && (!strict || o.length > 0)
    }

    Vue.prototype.$isPlainObject = function (o, strict = true) {
      let isObj = typeof o === 'object' && Object.prototype.toString.call(o).toLowerCase() === '[object object]' && !o.length
      if (strict && isObj) {
        let empty = true
        for (let p in o) {
          empty = !p
          break
        }
        isObj = !empty
      }
      return isObj
    }

    Vue.prototype.$isDate = function (o, strict = true) {
      let isdate = o instanceof Date
      if (isdate && strict) {
        isdate = !isNaN(o.getTime())
      }
      return isdate
    }

    Vue.prototype.$routerLink = function (text, path, tooltip) {
      let able = false
      if (path && Vue.prototype.$isArray(Vue.prototype.$privilege) && Vue.prototype.$privilege.length > 0) {
        for (let p of Vue.prototype.$privilege) {
          let matchPath = p.path.replace(/(:(\w+))/i, (a, b, c) => {
            return p.param[c]
          })
          matchPath = '/' + matchPath
          if (matchPath === path) {
            able = true
          }
        }
      }

      let com = {}

      if (able) {
        com.template = tooltip ? `<Tooltip content="${tooltip}"><router-link :to="{path: '${path}'}">${text}</router-link></Tooltip>` : `<router-link :to="{path: '${path}'}">${text}</router-link>`
      } else {
        com.template = `<span>${text}</span>`
      }

      return com
    }

    Vue.prototype.$ScriptLinker = function (url) {
      return new Promise((resolve, reject) => {
        if (url) {
          let script = document.createElement('script')
          script.type = 'text/javascript'
          script.src = url
          console.log('create script tag...')
          if (script.readyState) {
            // ie
            script.onreadystatechange = () => {
              if (script.readyState === 'loaded' || script.readyState === 'complete') {
                script.onreadystatechange = null
                resolve()
              }
            }
          } else {
            script.onload = () => {
              console.log('completed.', arguments)
              script.onload = null
              resolve()
            }
          }
          document.getElementsByTagName('head')[0].appendChild(script)
        } else {
          reject(new Error('URL params is required!'))
        }
      })
    }

    Vue.prototype.$Install = function (io, name) {
      if (io) {
        if (name) {
          Vue.use(io, {name: name})
        } else {
          Vue.use(io)
        }
      }
    }

    Vue.prototype.$SHA265 = function (s) {
      let chrsz = 8;
      let hexcase = 0;

      function safeAdd (x, y) {
        let lsw = (x & 0xFFFF) + (y & 0xFFFF);
        let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
      }

      function S (X, n) {
        return (X >>> n) | (X << (32 - n));
      }

      function R (X, n) {
        return (X >>> n);
      }

      function Ch (x, y, z) {
        return ((x & y) ^ ((~x) & z));
      }

      function Maj (x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z));
      }

      function Sigma0256 (x) {
        return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
      }

      function Sigma1256 (x) {
        return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
      }

      function Gamma0256 (x) {
        return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
      }

      function Gamma1256 (x) {
        return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
      }

      function coreSha256 (m, l) {
        let K = [0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2];
        let HASH = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19];
        /* eslint-disable no-new */
        let W = new Array(64);
        let a, b, c, d, e, f, g, h, i, j;
        let T1, T2;
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;
        for (i = 0; i < m.length; i += 16) {
          a = HASH[0];
          b = HASH[1];
          c = HASH[2];
          d = HASH[3];
          e = HASH[4];
          f = HASH[5];
          g = HASH[6];
          h = HASH[7];
          for (j = 0; j < 64; j++) {
            if (j < 16) W[j] = m[j + i];
            else W[j] = safeAdd(safeAdd(safeAdd(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
            T1 = safeAdd(safeAdd(safeAdd(safeAdd(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
            T2 = safeAdd(Sigma0256(a), Maj(a, b, c));
            h = g;
            g = f;
            f = e;
            e = safeAdd(d, T1);
            d = c;
            c = b;
            b = a;
            a = safeAdd(T1, T2);
          }
          HASH[0] = safeAdd(a, HASH[0]);
          HASH[1] = safeAdd(b, HASH[1]);
          HASH[2] = safeAdd(c, HASH[2]);
          HASH[3] = safeAdd(d, HASH[3]);
          HASH[4] = safeAdd(e, HASH[4]);
          HASH[5] = safeAdd(f, HASH[5]);
          HASH[6] = safeAdd(g, HASH[6]);
          HASH[7] = safeAdd(h, HASH[7]);
        }
        return HASH;
      }

      function str2binb (str) {
        let bin = [];
        let mask = (1 << chrsz) - 1;
        for (let i = 0; i < str.length * chrsz; i += chrsz) {
          bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
        }
        return bin;
      }

      function Utf8Encode (string) {
        string = string.replace(/\r\n/g, '\n');
        let utftext = '';
        for (let n = 0; n < string.length; n++) {
          let c = string.charCodeAt(n);
          if (c < 128) {
            utftext += String.fromCharCode(c);
          } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
          } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
          }
        }
        return utftext;
      }

      function binb2hex (binarray) {
        let hexTab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
        let str = '';
        for (let i = 0; i < binarray.length * 4; i++) {
          str += hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
            hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
      }

      s = Utf8Encode(s);
      return binb2hex(coreSha256(str2binb(s), s.length * chrsz));
    }
  }
}
