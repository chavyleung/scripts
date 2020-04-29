const cookieName = '米读'
const readTimeurlKey = 'senku_readTimeurl_midu'
const readTimeheaderKey = 'senku_readTimeheader_midu'
const readTimebodyKey = 'senku_readTimebody_midu'
const senku = init()

const requrl = $request.url

if ($request && $request.method != 'OPTIONS' && requrl.match(/\/user\/readTimeBase\/readTime/)) {
    try {
        const readTimeurlVal = requrl
        const readTimebodyVal = $request.body
        const readTimeheaderVal = $request.headers
        if (readTimeurlVal && readTimebodyVal && readTimeheaderVal) {
            senku.setdata(readTimeurlVal, readTimeurlKey)
            senku.setdata(readTimeheaderVal, readTimeheaderKey)
            senku.setdata(readTimebodyVal, readTimebodyKey)
            senku.msg(cookieName, `阅读时长,获取Cookie: 成功`, ``)
            senku.log(`🔔${readTimeurlVal},🔔${readTimeheaderVal},🔔${readTimebodyVal}`)
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
