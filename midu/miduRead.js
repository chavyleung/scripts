// 赞赏:邀请码`A1040276307`
// 链接`http://html34.qukantoutiao.net/qpr2/bBmQ.html?pid=5eb14518`
// 农妇山泉 -> 有点咸

const cookieName = '米读阅读时长'
const readTimebodyKey = 'senku_readTimebody_midu'
// 账号一
const readTimeheaderKey = 'senku_readTimeheader_midu'
const signbodyKey = 'senku_signbody_midu'
const tokenKey = 'tokenMidu_read'
// 账号二
const readTimeheaderKey2 = 'senku_readTimeheader_midu2'
const signbodyKey2 = 'senku_signbody_midu2'
const tokenKey2 = 'tokenMidu_read2'

const senku = init()
const readTimebodyVal = senku.getdata(readTimebodyKey)

const readTimeheaderVal = senku.getdata(readTimeheaderKey)
const readTimeheaderVal2 = senku.getdata(readTimeheaderKey2)
const token = senku.getdata(tokenKey)
const token2 = senku.getdata(tokenKey2)
const readTimeurlVal = 'https://apiwz.midukanshu.com/user/readTimeBase/readTime?' + readTimebodyVal
const signinfo = {}
senku.log(senku.getdata('tokenMidu_sign'))
senku.log(senku.getdata('tokenMidu_sign2'))
// 清除Cookie,将下方改为true,默认false
const DeleteCookie = false
if (DeleteCookie) {
    if (token) {
        senku.setdata("", "tokenMidu_read")
        senku.setdata("", "tokenMidu_read2")
        senku.setdata("", "tokenMidu_sign")
        senku.setdata("", "tokenMidu_sign2")
        senku.msg("米读 Cookie清除成功 !", "", '请手动关闭脚本内"DeleteCookie"选项')
    } else {
        senku.msg("米读 无可清除的Cookie !", "", '请手动关闭脚本内"DeleteCookie"选项')
    }
}
; (sign = async () => {
    senku.log(`🔔 ${cookieName},token:${token} token2:${token2}`)
    if (token) {
        await readTime(readTimeheaderVal, '账号一')
    }
    if (token2) {
        await readTime(readTimeheaderVal2, '账号二')
    }
    senku.done()
})().catch((e) => senku.log(`❌ ${cookieName} 签到失败: ${e}`), senku.done())


// 阅读时长
function readTime(header, account) {
    return new Promise((resolve, reject) => {
        const url = { url: readTimeurlVal, headers: JSON.parse(header) }
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} readTime - response: ${JSON.stringify(response)}`)
                signinfo.readTime = JSON.parse(data)
                let subTitle = ''
                let detail = ''
                if (signinfo.readTime && signinfo.readTime.code == 0) {
                    const coin = signinfo.readTime.data.coin
                    const readTotalMinute = signinfo.readTime.data.readTotalMinute
                    coin == 0 ? detail += `` : detail += `【阅读时长】获得${coin}💰`
                    if (readTotalMinute % 20 == 0) {
                        readTotalMinute ? detail += ` 阅读时长${readTotalMinute / 2}分钟` : detail += ``
                        senku.msg(cookieName, account + subTitle, detail)
                    }
                } else if (signinfo.readTime.code != 0) {
                    detail += `【阅读时长】错误代码${signinfo.readTime.code},错误信息${signinfo.readTime.message}`
                    senku.msg(cookieName, account + subTitle, detail)
                } else {
                    detail += '【阅读时长】失败'
                    senku.msg(cookieName, account + subTitle, detail)
                }
                resolve()
            } catch (e) {
                senku.msg(cookieName, account + `阅读时长: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} readTime - 签到失败: ${e}`)
                senku.log(`❌ ${cookieName} readTime - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
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
            $task.fetch(url).then((resp) => cb(null, resp, resp.body))
        }
    }
    post = (url, cb) => {
        if (isSurge()) {
            $httpClient.post(url, cb)
        }
        if (isQuanX()) {
            url.method = 'POST'
            $task.fetch(url).then((resp) => cb(null, resp, resp.body))
        }
    }
    done = (value = {}) => {
        $done(value)
    }
    return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
