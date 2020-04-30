const cookieName = '米读'
const readTimebodyKey = 'senku_readTimebody_midu'
const readTimeheaderKey = 'senku_readTimeheader_midu'
const signbodyKey = 'senku_signbody_midu'
const senku = init()

const requrl = $request.url

if ($request && $request.method != 'OPTIONS' && requrl.match(/\/user\/readTimeBase\/readTime/)) {
    try {
        const readTimebodyVal = $request.body
        const readTimeheaderVal = JSON.stringify($request.headers)
        if (readTimebodyVal) {
            if (readTimebodyVal.indexOf('EncStr=') > 0) {
                senku.setdata(readTimebodyVal, readTimebodyKey)
                senku.setdata(readTimeheaderVal, readTimeheaderKey)
                senku.msg(cookieName, `阅读时长,获取Cookie: 成功`, ``)
                senku.log(`🔔${readTimeheaderVal}`)
            }
        }
    } catch (error) {
        senku.log(`❌error:${error}`)
    }
}

if ($request && $request.method != 'OPTIONS' && requrl.match(/\/wz\/task\/listV2/)) {
    try {
        const signbodyVal = $request.body
        if (signbodyVal) {
            senku.setdata(signbodyVal, signbodyKey)
            senku.msg(cookieName, `签到,获取Cookie: 成功`, ``)
            senku.log(`🔔${signbodyVal}`)
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
