
const readTimebodyKey = 'senku_readTimebody_midu'
// 账号一
const readTimeheaderKey = 'senku_readTimeheader_midu'
const signbodyKey = 'senku_signbody_midu'
// 账号二
const readTimeheaderKey2 = 'senku_readTimeheader_midu2'
const signbodyKey2 = 'senku_signbody_midu2'

const senku = init()
const requrl = $request.url


if ($request && $request.method != 'OPTIONS' && requrl.match(/\/user\/readTimeBase\/readTime/)) {
    try {
        const readTimebodyVal = $request.body
        const CookieValue = $request.headers
        if (readTimebodyVal) {
            var body = senku.setdata(readTimebodyVal, readTimebodyKey)
            if (body) {
                senku.msg("米读", "阅读文章", "更新Cookie成功 ‼️")
            }
        }

        var account = senku.getdata('tokenMidu_read') ? senku.getdata('tokenMidu_read') : null
        var account2 = senku.getdata('tokenMidu_read2') ? senku.getdata('tokenMidu_read2') : null
        var tokenVal = CookieValue['token']
        if (!account || tokenVal == account) {
            var CookieName = '【账号一】'
            var CookieKey = 'senku_readTimeheader_midu'
            var tokenKey = 'tokenMidu_read'
        } else if (!account2 || tokenVal == account2) {
            var CookieName = '【账号二】'
            var CookieKey = 'senku_readTimeheader_midu2'
            var tokenKey = 'tokenMidu_read2'
        } else {
            senku.msg("米读", "更新米读->阅读Cookie失败", '非历史写入账号 ‼️')
        }
        if (senku.getdata(tokenKey)) {
            if (senku.getdata(tokenKey) != tokenVal) {
                var token = senku.setdata(tokenVal, tokenKey)
                var header = senku.setdata(JSON.stringify(CookieValue), CookieKey)
                senku.log(`🔔${readTimebodyVal}`)
                senku.log(`🔔${JSON.stringify(CookieValue)}`)
                if (!token && !header) {
                    senku.msg("米读", "阅读", "更新" + CookieName + "Cookie失败 ‼️")
                } else {
                    senku.msg("米读", "阅读", "更新" + CookieName + "Cookie成功 🎉")
                }
            }
        } else {
            var token = senku.setdata(tokenVal, tokenKey)
            var header = senku.setdata(JSON.stringify(CookieValue), CookieKey)
            senku.log(`🍎${tokenVal}`)
            senku.log(`🔔${readTimebodyVal}`)
            if (!header && !token) {
                senku.msg("米读", "阅读", "首次写入" + CookieName + "Cookie失败 ‼️")
            } else {
                senku.msg("米读", "阅读", "首次写入" + CookieName + "Cookie成功 🎉")
            }
        }

    } catch (error) {
        senku.log(`❌error:${error}`)
    }
}

if ($request && $request.method != 'OPTIONS' && requrl.match(/\/wz\/dice\/index/)) {
    try {
        var CookieValue = $request.body
        var account = senku.getdata('tokenMidu_sign') ? senku.getdata('tokenMidu_sign') : null
        var account2 = senku.getdata('tokenMidu_sign2') ? senku.getdata('tokenMidu_sign2') : null
        var tkVal = CookieValue.match(/token=[a-zA-Z0-9._-]+/)[0]
        var tokenVal = tkVal.substring(6, tkVal.length)
        if (!account || tokenVal == account) {
            var CookieName = '【账号一】'
            var CookieKey = 'senku_signbody_midu'
            var tokenKey = 'tokenMidu_sign'
        } else if (!account2 || tokenVal == account2) {
            var CookieName = '【账号二】'
            var CookieKey = 'senku_signbody_midu2'
            var tokenKey = 'tokenMidu_sign2'
        } else {
            senku.msg("米读", "更新米读->签到Cookie失败", '非历史写入账号 ‼️')
        }
        senku.log(`🍎${senku.getdata(tokenKey)}`)
        senku.log(`🍎${tokenVal}`)
        if (senku.getdata(tokenKey)) {
            if (senku.getdata(tokenKey) != tokenVal) {
                var token = senku.setdata(tokenVal, tokenKey)
                var body = senku.setdata(CookieValue, CookieKey)
                if (!body && !token) {
                    senku.msg("米读", "签到", "更新" + CookieName + "Cookie失败 ‼️")
                } else {
                    senku.msg("米读", "签到", "更新" + CookieName + "Cookie成功 🎉")
                }
            }
        } else {
            var token = senku.setdata(tokenVal, tokenKey)
            var body = senku.setdata(CookieValue, CookieKey)
            senku.log(`🍎${tokenVal}`)
            if (!body && !token) {
                senku.msg("米读", "签到", "首次写入" + CookieName + "Cookie失败 ‼️")
            } else {
                senku.msg("米读", "签到", "首次写入" + CookieName + "Cookie成功 🎉")
            }
        }
    } catch (error) {
        senku.log(`❌error:${error}`)
    }
}

function init() {
    isSurge = () => {
        return undefined === this.$httpClient ? false : true
    }
    isQuanX = () => {
        return undefined === this.$task ? false : true
    }
    getdata = (key) => {
        if (isSurge()) return $persistentStore.read(key)
        if (isQuanX()) return $prefs.valueForKey(key)
    }
    setdata = (key, val) => {
        if (isSurge()) return $persistentStore.write(key, val)
        if (isQuanX()) return $prefs.setValueForKey(key, val)
    }
    msg = (title, subtitle, body) => {
        if (isSurge()) $notification.post(title, subtitle, body)
        if (isQuanX()) $notify(title, subtitle, body)
    }
    log = (message) => console.log(message)
    get = (url, cb) => {
        if (isSurge()) {
            $httpClient.get(url, cb)
        }
        if (isQuanX()) {
            url.method = 'GET'
            $task.fetch(url).then((resp) => cb(null, {}, resp.body))
        }
    }
    post = (url, cb) => {
        if (isSurge()) {
            $httpClient.post(url, cb)
        }
        if (isQuanX()) {
            url.method = 'POST'
            $task.fetch(url).then((resp) => cb(null, {}, resp.body))
        }
    }
    done = (value = {}) => {
        $done(value)
    }
    return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
senku.done()
