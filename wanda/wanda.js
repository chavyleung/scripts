const $ = new Env('万达电影')
$._mi_ = 'senku_wanda_mi_'
$.desc = []
$.signCode = '827125666'
$.questionCode = '15884027'
const date = tTime(new Date().getTime())

function getKey(){
    const ts = new Date().getTime()
    const key = 'Wanda1_3B3AA12B0145E1982F282BEDD8A3305B89A9811280C0B8CC3A6A60D81022E4903'+ts
    return {'key':key,'ts':ts}
}
const mx_api = {
    "ver":"v1.0.0",
    "sCode":"Wanda",
    "_mi_":`${$.getdata($._mi_)}`,
    "width":1280,
    "json":true,
    "cCode":"1_3",
    "check":'',
    "ts":0,
    "heigth":720,
    "appId":"3"
}

!(async () => {
    await sign()
    await signRecord()
    // await question_()
    // await question()
    // await answer()
    // await drawprize_ans()
    // await drawprize_ans()
    if ($.signRecord.data.remainMedal >= 50 ) {
        await lottery()
    }
    await showmsg()
  })()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
  


function sign() {
    return new Promise((resolve) => {
        const signVal = getKey()['key'] + '/activityWholeSign/wholeSignUp.apiactivityCode='+$.signCode+'&signDate='+date
        mx_api['ts'] = getKey()['ts']
        mx_api['check'] = hex_md5(signVal)
        const url = {
            url:'https://activity-api-mx.wandafilm.com/activityWholeSign/wholeSignUp.api',
            headers:{
                'MX-API':JSON.stringify(mx_api),
            },
            body : 'activityCode='+$.signCode+'&signDate=' + date
            }
        $.post(url, (err, resp, data) => {
            try {
                $.sign = JSON.parse(data)
            } catch (e) {
            $.logErr(e, resp)
            } finally {
            resolve()
            }
        })
    })
}

function signRecord() {
    return new Promise((resolve) => {
        const signRecordVal = getKey()['key']+'/activityWholeSign/getSignRecord.apiactivityCode='+$.signCode
        mx_api['ts'] = getKey()['ts']
        mx_api['check'] = hex_md5(signRecordVal)
        const url = {
            url:'https://activity-api-mx.wandafilm.com/activityWholeSign/getSignRecord.api',
            headers:{
                'MX-API':JSON.stringify(mx_api),
            },
            body : 'activityCode='+$.signCode
            }
        $.post(url, (err, resp, data) => {
            try {
                $.signRecord = JSON.parse(data)
            } catch (e) {
            $.logErr(e, resp)
            } finally {
            resolve()
            }
        })
    })
}

function lottery() {
    return new Promise((resolve) => {
        const signVal = getKey()['key'] + '/activityWholeSign/prize/lottery.apiactivityCode='+$.signCode+'&vcode=&requestId='
        mx_api['ts'] = getKey()['ts']
        mx_api['check'] = hex_md5(signVal)
        const url = {
            url:'https://activity-api-mx.wandafilm.com/activityWholeSign/prize/lottery.api',
            headers:{
                'MX-API':JSON.stringify(mx_api),
            },
            body : 'activityCode='+$.signCode+'&vcode=&requestId='
            }
        $.post(url, (err, resp, data) => {
            try {
                $.lottery = JSON.parse(data)
                console.log(data)
            } catch (e) {
            $.logErr(e, resp)
            } finally {
            resolve()
            }
        })
    })
}

function question_() {
    return new Promise((resolve) => {
        const questionVal = getKey()['key']+'/question/qustion/strength.apiactivityCode='+$.questionCode
        mx_api['ts'] = getKey()['ts']
        mx_api['check'] = hex_md5(questionVal)
        const url = {
            url:'https://activity-api-mx.wandafilm.com/question/qustion/strength.api',
            headers:{
                'MX-API':JSON.stringify(mx_api),
            },
            body : 'activityCode='+$.questionCode
        }
        $.post(url, (err, resp, data) => {
            try {
                $.log(`尝试性报名答题`)
            } catch (e) {
            $.logErr(e, resp)
            } finally {
            resolve()
            }
        })
    })
}

// 获取题目答案
function question() {
    return new Promise((resolve) => {
        const questionVal = getKey()['key']+'/question/question_list.apiactivityCode='+$.questionCode
        mx_api['ts'] = getKey()['ts']
        mx_api['check'] = hex_md5(questionVal)
        const url = {
            url:'https://activity-api-mx.wandafilm.com/question/question_list.api',
            headers:{
                'MX-API':JSON.stringify(mx_api),
            },
            body : 'activityCode='+$.questionCode
        }
        $.post(url, (err, resp, data) => {
            try {
                const res = JSON.parse(data)
                $.answer = res.data.questionList[0].movie.nameCN
            } catch (e) {
            $.logErr(e, resp)
            } finally {
            resolve()
            }
        })
    })
}

// 答题
function answer() {
    return new Promise((resolve) => {
        const answerVal = getKey()['key'] + '/question/qustion/answer.apiactivityCode='+$.questionCode+'&answer=%7b%221%22%3a%22'+escape(`${$.answer}`).toLowerCase()+'%22%7d'
        mx_api['ts'] = getKey()['ts']
        mx_api['check'] = hex_md5(answerVal)
        const url = {
            url:'https://activity-api-mx.wandafilm.com/question/qustion/answer.api',
            headers:{
                'MX-API':JSON.stringify(mx_api),
            },
            body : 'activityCode='+$.questionCode+'&answer=%7B%221%22%3A%22'+encodeURI(`${$.answer}`) + '%22%7D'
        }
        $.post(url, (err, resp, data) => {
            try {
                $.answer = JSON.parse(data)
            } catch (e) {
            $.logErr(e, resp)
            } finally {
            resolve()
            }
        })
    })
}

// 答题后抽奖
function drawprize_ans() {
    return new Promise((resolve) => {
        const drawprizeVal = getKey()['key']+'/question/prize/lottery.apiactivityCode='+$.questionCode
        mx_api['ts'] = getKey()['ts']
        mx_api['check'] = hex_md5(drawprizeVal)
        const url = {
            url:'https://activity-api-mx.wandafilm.com/question/prize/lottery.api',
            headers:{
                'MX-API':JSON.stringify(mx_api),
            },
            body : 'activityCode='+$.questionCode
        }
        $.post(url, (err, resp, data) => {
            try {
                const res  = JSON.parse(data)
                $.desc.push(`答题抽奖:${res.data.prize.prizeName}`)
            } catch (e) {
            $.logErr(e, resp)
            } finally {
            resolve()
            }
        })
    })
}

function showmsg() {
    return new Promise((resolve) => {
        $.subt = `签到:${$.sign.code == 1 ? `成功` : $.sign.msg}`
        
        if ($.signRecord.code == 1) {
            const totalMedal = $.signRecord.data.totalMedal
            const remainMedal = $.signRecord.data.remainMedal
            $.desc.push(`总计获得${totalMedal}能量,剩余可用${remainMedal}能量`)
        }
        //$.subt += ` 答题详情:${$.answer.code == 1 ? `答案:${$.answer.data.answer},获得:${$.answer.data.remainChance}次抽奖`:$.answer.msg}`
        $.lottery ? $.desc.push(`签到抽奖:${$.lottery.data.prize.prizeName}`) : ``
        $.msg($.name, $.subt, $.desc.join('\n'))
        resolve()
    })
}

function tTime(timestamp) {
    const date = new Date(timestamp)
    const Y = date.getFullYear() + '-'
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    const D = (date.getDate() + 1 < 10 ? '0' + date.getDate() : date.getDate())
    return Y + M + D
}
function hex_md5(r){return rstr2hex(rstr_md5(str2rstr_utf8(r)))}function b64_md5(r){return rstr2b64(rstr_md5(str2rstr_utf8(r)))}function any_md5(r,t){return rstr2any(rstr_md5(str2rstr_utf8(r)),t)}function hex_hmac_md5(r,t){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)))}function b64_hmac_md5(r,t){return rstr2b64(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)))}function any_hmac_md5(r,t,d){return rstr2any(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)),d)}function md5_vm_test(){return"900150983cd24fb0d6963f7d28e17f72"==hex_md5("abc").toLowerCase()}function rstr_md5(r){return binl2rstr(binl_md5(rstr2binl(r),8*r.length))}function rstr_hmac_md5(r,t){var d=rstr2binl(r);d.length>16&&(d=binl_md5(d,8*r.length));for(var n=Array(16),_=Array(16),m=0;m<16;m++)n[m]=909522486^d[m],_[m]=1549556828^d[m];var f=binl_md5(n.concat(rstr2binl(t)),512+8*t.length);return binl2rstr(binl_md5(_.concat(f),640))}function rstr2hex(r){for(var t,d=hexcase?"0123456789ABCDEF":"0123456789abcdef",n="",_=0;_<r.length;_++)t=r.charCodeAt(_),n+=d.charAt(t>>>4&15)+d.charAt(15&t);return n}function rstr2b64(r){for(var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",d="",n=r.length,_=0;_<n;_+=3)for(var m=r.charCodeAt(_)<<16|(_+1<n?r.charCodeAt(_+1)<<8:0)|(_+2<n?r.charCodeAt(_+2):0),f=0;f<4;f++)8*_+6*f>8*r.length?d+=b64pad:d+=t.charAt(m>>>6*(3-f)&63);return d}function rstr2any(r,t){var d,n,_,m,f,h=t.length,e=Array(Math.ceil(r.length/2));for(d=0;d<e.length;d++)e[d]=r.charCodeAt(2*d)<<8|r.charCodeAt(2*d+1);var a=Math.ceil(8*r.length/(Math.log(t.length)/Math.log(2))),i=Array(a);for(n=0;n<a;n++){for(f=Array(),m=0,d=0;d<e.length;d++)m=(m<<16)+e[d],_=Math.floor(m/h),m-=_*h,(f.length>0||_>0)&&(f[f.length]=_);i[n]=m,e=f}var o="";for(d=i.length-1;d>=0;d--)o+=t.charAt(i[d]);return o}function str2rstr_utf8(r){for(var t,d,n="",_=-1;++_<r.length;)t=r.charCodeAt(_),d=_+1<r.length?r.charCodeAt(_+1):0,55296<=t&&t<=56319&&56320<=d&&d<=57343&&(t=65536+((1023&t)<<10)+(1023&d),_++),t<=127?n+=String.fromCharCode(t):t<=2047?n+=String.fromCharCode(192|t>>>6&31,128|63&t):t<=65535?n+=String.fromCharCode(224|t>>>12&15,128|t>>>6&63,128|63&t):t<=2097151&&(n+=String.fromCharCode(240|t>>>18&7,128|t>>>12&63,128|t>>>6&63,128|63&t));return n}function str2rstr_utf16le(r){for(var t="",d=0;d<r.length;d++)t+=String.fromCharCode(255&r.charCodeAt(d),r.charCodeAt(d)>>>8&255);return t}function str2rstr_utf16be(r){for(var t="",d=0;d<r.length;d++)t+=String.fromCharCode(r.charCodeAt(d)>>>8&255,255&r.charCodeAt(d));return t}function rstr2binl(r){for(var t=Array(r.length>>2),d=0;d<t.length;d++)t[d]=0;for(d=0;d<8*r.length;d+=8)t[d>>5]|=(255&r.charCodeAt(d/8))<<d%32;return t}function binl2rstr(r){for(var t="",d=0;d<32*r.length;d+=8)t+=String.fromCharCode(r[d>>5]>>>d%32&255);return t}function binl_md5(r,t){r[t>>5]|=128<<t%32,r[14+(t+64>>>9<<4)]=t;for(var d=1732584193,n=-271733879,_=-1732584194,m=271733878,f=0;f<r.length;f+=16){var h=d,e=n,a=_,i=m;d=md5_ff(d,n,_,m,r[f+0],7,-680876936),m=md5_ff(m,d,n,_,r[f+1],12,-389564586),_=md5_ff(_,m,d,n,r[f+2],17,606105819),n=md5_ff(n,_,m,d,r[f+3],22,-1044525330),d=md5_ff(d,n,_,m,r[f+4],7,-176418897),m=md5_ff(m,d,n,_,r[f+5],12,1200080426),_=md5_ff(_,m,d,n,r[f+6],17,-1473231341),n=md5_ff(n,_,m,d,r[f+7],22,-45705983),d=md5_ff(d,n,_,m,r[f+8],7,1770035416),m=md5_ff(m,d,n,_,r[f+9],12,-1958414417),_=md5_ff(_,m,d,n,r[f+10],17,-42063),n=md5_ff(n,_,m,d,r[f+11],22,-1990404162),d=md5_ff(d,n,_,m,r[f+12],7,1804603682),m=md5_ff(m,d,n,_,r[f+13],12,-40341101),_=md5_ff(_,m,d,n,r[f+14],17,-1502002290),n=md5_ff(n,_,m,d,r[f+15],22,1236535329),d=md5_gg(d,n,_,m,r[f+1],5,-165796510),m=md5_gg(m,d,n,_,r[f+6],9,-1069501632),_=md5_gg(_,m,d,n,r[f+11],14,643717713),n=md5_gg(n,_,m,d,r[f+0],20,-373897302),d=md5_gg(d,n,_,m,r[f+5],5,-701558691),m=md5_gg(m,d,n,_,r[f+10],9,38016083),_=md5_gg(_,m,d,n,r[f+15],14,-660478335),n=md5_gg(n,_,m,d,r[f+4],20,-405537848),d=md5_gg(d,n,_,m,r[f+9],5,568446438),m=md5_gg(m,d,n,_,r[f+14],9,-1019803690),_=md5_gg(_,m,d,n,r[f+3],14,-187363961),n=md5_gg(n,_,m,d,r[f+8],20,1163531501),d=md5_gg(d,n,_,m,r[f+13],5,-1444681467),m=md5_gg(m,d,n,_,r[f+2],9,-51403784),_=md5_gg(_,m,d,n,r[f+7],14,1735328473),n=md5_gg(n,_,m,d,r[f+12],20,-1926607734),d=md5_hh(d,n,_,m,r[f+5],4,-378558),m=md5_hh(m,d,n,_,r[f+8],11,-2022574463),_=md5_hh(_,m,d,n,r[f+11],16,1839030562),n=md5_hh(n,_,m,d,r[f+14],23,-35309556),d=md5_hh(d,n,_,m,r[f+1],4,-1530992060),m=md5_hh(m,d,n,_,r[f+4],11,1272893353),_=md5_hh(_,m,d,n,r[f+7],16,-155497632),n=md5_hh(n,_,m,d,r[f+10],23,-1094730640),d=md5_hh(d,n,_,m,r[f+13],4,681279174),m=md5_hh(m,d,n,_,r[f+0],11,-358537222),_=md5_hh(_,m,d,n,r[f+3],16,-722521979),n=md5_hh(n,_,m,d,r[f+6],23,76029189),d=md5_hh(d,n,_,m,r[f+9],4,-640364487),m=md5_hh(m,d,n,_,r[f+12],11,-421815835),_=md5_hh(_,m,d,n,r[f+15],16,530742520),n=md5_hh(n,_,m,d,r[f+2],23,-995338651),d=md5_ii(d,n,_,m,r[f+0],6,-198630844),m=md5_ii(m,d,n,_,r[f+7],10,1126891415),_=md5_ii(_,m,d,n,r[f+14],15,-1416354905),n=md5_ii(n,_,m,d,r[f+5],21,-57434055),d=md5_ii(d,n,_,m,r[f+12],6,1700485571),m=md5_ii(m,d,n,_,r[f+3],10,-1894986606),_=md5_ii(_,m,d,n,r[f+10],15,-1051523),n=md5_ii(n,_,m,d,r[f+1],21,-2054922799),d=md5_ii(d,n,_,m,r[f+8],6,1873313359),m=md5_ii(m,d,n,_,r[f+15],10,-30611744),_=md5_ii(_,m,d,n,r[f+6],15,-1560198380),n=md5_ii(n,_,m,d,r[f+13],21,1309151649),d=md5_ii(d,n,_,m,r[f+4],6,-145523070),m=md5_ii(m,d,n,_,r[f+11],10,-1120210379),_=md5_ii(_,m,d,n,r[f+2],15,718787259),n=md5_ii(n,_,m,d,r[f+9],21,-343485551),d=safe_add(d,h),n=safe_add(n,e),_=safe_add(_,a),m=safe_add(m,i)}return Array(d,n,_,m)}function md5_cmn(r,t,d,n,_,m){return safe_add(bit_rol(safe_add(safe_add(t,r),safe_add(n,m)),_),d)}function md5_ff(r,t,d,n,_,m,f){return md5_cmn(t&d|~t&n,r,t,_,m,f)}function md5_gg(r,t,d,n,_,m,f){return md5_cmn(t&n|d&~n,r,t,_,m,f)}function md5_hh(r,t,d,n,_,m,f){return md5_cmn(t^d^n,r,t,_,m,f)}function md5_ii(r,t,d,n,_,m,f){return md5_cmn(d^(t|~n),r,t,_,m,f)}function safe_add(r,t){var d=(65535&r)+(65535&t),n=(r>>16)+(t>>16)+(d>>16);return n<<16|65535&d}function bit_rol(r,t){return r<<t|r>>>32-t}var hexcase=0,b64pad="";  
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
