// 赞赏:邀请码`A1040276307`
// 链接`http://html34.qukantoutiao.net/qpr2/bBmQ.html?pid=5eb14518`
// 农妇山泉 -> 有点咸

/********************
 * 1、 为了方便任意脚本可以清除Cookie, 任意一个脚本将DeleteCookie = true都可以生效
 * 2、 debug模式可以在Surge&&Qx中开启,方便你判定多用户及脚本运行情况
 * 3、 Qx==>dubug:miduRede构造请求
 * 4、 Surge==>debug:load脚本->evalaute
 * 5、脚本默认每半小时通知一次,建议自己先debug看看是否成功
 *********************/

const DeleteCookie = false // 清除Cookie,将下方改为true,默认false

const debug = false // 开启debug模式,每次脚本执行会显示通知,默认false

const bind = true // 绑定作者邀请码,默认true,可更改为false

const cookieName = '米读阅读时长'

const senku = init()


if (DeleteCookie) {
    if (senku.getdata('tokenMidu_read') || senku.getdata('tokenMidu_sign')) {
        senku.setdata("", "tokenMidu_read")
        senku.setdata("", "tokenMidu_read2")
        senku.setdata("", "tokenMidu_sign")
        senku.setdata("", "tokenMidu_sign2")
        senku.msg("米读 Cookie清除成功 !", "", '请手动关闭脚本内"DeleteCookie"选项')
    } else {
        senku.msg("米读 无可清除的Cookie !", "", '请手动关闭脚本内"DeleteCookie"选项')
    }
}
debug ? senku.setdata('true', 'debug') : senku.setdata('false', 'debug')
bind ? '' : senku.setdata('', 'bind');

function initial() {
    signinfo = {
        addnumList: [],
        rollList: [],
        doubleList: [],
        drawPrizeList: []
    }
}

(sign = () => {
    senku.log(`🔔 ${cookieName}`)
    senku.getdata('tokenMidu_read') ? '' : senku.msg('米读阅读', '', '不存在Cookie')
    DualAccount = true
    if (senku.getdata('tokenMidu_read')) {
        readTimeheaderVal = senku.getdata('senku_readTimeheader_midu')
        readTimebodyVal = senku.getdata('senku_readTimebody_midu')
        signbodyVal = senku.getdata('senku_signbody_midu')
        all()
    }
    senku.done()
})().catch((e) => senku.log(`❌ ${cookieName} 签到失败: ${e}`), senku.done())


async function all() {
    senku.log(`🍎${readTimeheaderVal}`)
    const headerVal = readTimeheaderVal
    const urlVal = readTimebodyVal
    const key = signbodyVal
    initial()

    await readTime(headerVal, urlVal)
    await userInfo(key)
    await showmsg()

}

function double() {
    initial()
    DualAccount = false
    if (senku.getdata('tokenMidu_read2')) {
        readTimeheaderVal = senku.getdata('senku_readTimeheader_midu2')
        readTimebodyVal = senku.getdata('senku_readTimebody_midu2')
        signbodyVal = senku.getdata('senku_signbody_midu2')
        all()
    }
}

// 阅读时长
function readTime(header, urlVal) {
    return new Promise((resolve, reject) => {
        const url = {
            url: 'https://apiwz.midukanshu.com/user/readTimeBase/readTime?' + urlVal,
            headers: JSON.parse(header)
        }
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} readTime - response: ${JSON.stringify(response)}`)
                signinfo.readTime = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, +`阅读时长: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} readTime - 签到失败: ${e}`)
                senku.log(`❌ ${cookieName} readTime - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 用户信息
function userInfo(bodyVal) {
    return new Promise((resolve, reject) => {
        const userInfourlVal = 'https://apiwz.midukanshu.com/wz/user/getInfo?' + bodyVal
        const url = {
            url: userInfourlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} userInfo - response: ${JSON.stringify(response)}`)
                signinfo.userInfo = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `抽奖: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} userInfo - 抽奖失败: ${e}`)
                senku.log(`❌ ${cookieName} userInfo - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

function showmsg() {
    return new Promise((resolve, reject) => {
        let subTitle = ``
        let detail = ''
        if (signinfo.readTime && signinfo.readTime.code == 0) {
            const coin = signinfo.readTime.data.coin
            const readTotalMinute = signinfo.readTime.data.readTotalMinute
            const total_coin = signinfo.readTime.data.total_coin
            coin == 0 ? detail += `` : detail += `【阅读时长】获得${coin}💰`
            readTotalMinute ? detail += ` 阅读时长${readTotalMinute / 2}分钟,该账户:${total_coin}💰` : detail += `该账户:${total_coin}💰`
        } else if (signinfo.readTime.code != 0) {
            detail += `【阅读时长】错误代码${signinfo.readTime.code},错误信息${signinfo.readTime.message}`
        } else {
            detail += '【阅读时长】失败'
        }
        if (senku.getdata('debug') == 'true' || detail && signinfo.readTime.data.readTotalMinute % 60 == 0) {
            senku.msg(cookieName + ` 用户:${signinfo.userInfo.data.nickname}`, subTitle, detail)
        } else if (senku.getdata('debug') == 'true' || signinfo.readTime.data.readTotalMinute % 60 == 0) {
            senku.msg(cookieName + ` 用户:${signinfo.userInfo.data.nickname}`, '阅读结果', '时间未到')
        }
        if (DualAccount) double()
        senku.done()
        resolve()
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
    return {
        isSurge,
        isQuanX,
        msg,
        log,
        getdata,
        setdata,
        get,
        post,
        done
    }
}