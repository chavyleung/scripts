// 赞赏:邀请码`A1040276307`
// 链接`http://html34.qukantoutiao.net/qpr2/bBmQ.html?pid=5eb14518`
// 农妇山泉 -> 有点咸
const cookieName = '米读'
const senku = init()

function initial() {
    signinfo = {
        addnumList: [],
        rollList: [],
        doubleList: []
    }
}

;
(sign = () => {
    senku.log(`🔔 ${cookieName}`)
    if (senku.getdata('senku_signbody_midu')) {
        signbodyVal = senku.getdata('senku_signbody_midu')
        name = '账户一'
        all(name)
    }
    if (senku.getdata('senku_signbody_midu2')) {
        signbodyVal = senku.getdata('senku_signbody_midu2')
        name = '账户二'
        all(name)
    }
    if (!senku.getdata('senku_signbody_midu') && !senku.getdata('senku_signbody_midu2')) {
        senku.msg('米读签到', '', '不存在Cookie')
    }
    senku.done()
})().catch((e) => senku.log(`❌ ${cookieName} 签到失败: ${e}`), senku.done())

async function all(name) {
    senku.log(`🍎${name},${signbodyVal}`)
    const key = signbodyVal
    initial()
    await signDay(key)
    await signVideo(key)
    await dice_index(key)
    if (signinfo.dice_index && signinfo.dice_index.code == 0) {
        const remain_add_num = signinfo.dice_index.data.remain_add_chance_num
        const chance_num = signinfo.dice_index.data.chance_num
        for (let index = 0; index < remain_add_num; index++) {
            await dice_addnum()
        }

        for (let index = 0; index < 8; index++) {
            await dice_roll(key)
            await dice_double(key)
        }
    }
    await showmsg(name)
}

// 骰子信息
function dice_index() {
    return new Promise((resolve, reject) => {
        const dice_index_urlVal = 'https://apiwz.midukanshu.com/wz/dice/index?' + signbodyVal
        const url = {
            url: dice_index_urlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} dice_index - response: ${JSON.stringify(response)}`)
                signinfo.dice_index = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `骰子信息: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} dice_index - 骰子信息失败: ${e}`)
                senku.log(`❌ ${cookieName} dice_index - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 掷骰子
function dice_roll() {
    return new Promise((resolve, reject) => {
        const dice_roll_urlVal = 'https://apiwz.midukanshu.com/wz/dice/roll?' + signbodyVal
        const url = {
            url: dice_roll_urlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} dice_roll - response: ${JSON.stringify(response)}`)
                signinfo.rollList.push(JSON.parse(data))
                resolve()
            } catch (e) {
                senku.msg(cookieName, `掷骰子: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} dice_roll - 掷骰子失败: ${e}`)
                senku.log(`❌ ${cookieName} dice_roll - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 骰子双倍奖励
function dice_double() {
    return new Promise((resolve, reject) => {
        const dice_double_urlVal = 'https://apiwz.midukanshu.com/wz/dice/doubleReward?' + signbodyVal
        const url = {
            url: dice_double_urlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} dice_double - response: ${JSON.stringify(response)}`)
                signinfo.doubleList.push(JSON.parse(data))
                resolve()
            } catch (e) {
                senku.msg(cookieName, `骰子双倍奖励: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} dice_double - 骰子双倍奖励失败: ${e}`)
                senku.log(`❌ ${cookieName} dice_double - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 获取骰子次数
function dice_addnum() {
    return new Promise((resolve, reject) => {
        const dice_addnum_urlVal = 'https://apiwz.midukanshu.com/wz/dice/addChangeNumByRewardVideo?' + signbodyVal
        const url = {
            url: dice_addnum_urlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} dice_addnum - response: ${JSON.stringify(response)}`)
                signinfo.addnumList.push(JSON.parse(data))
                resolve()
            } catch (e) {
                senku.msg(cookieName, `获取骰子次数: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} dice_addnum - 获取骰子次数失败: ${e}`)
                senku.log(`❌ ${cookieName} dice_addnum - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 每日签到
function signDay() {
    return new Promise((resolve, reject) => {
        const signurlVal = 'https://apiwz.midukanshu.com/wz/task/signInV2?' + signbodyVal
        const url = {
            url: signurlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} signDay - response: ${JSON.stringify(response)}`)
                signinfo.signDay = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} signDay - 签到失败: ${e}`)
                senku.log(`❌ ${cookieName} signDay - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 签到视频奖励
function signVideo() {
    return new Promise((resolve, reject) => {
        const signVideourlVal = 'https://apiwz.midukanshu.com/wz/task/signVideoReward?' + signbodyVal
        const url = {
            url: signVideourlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} signVideo - response: ${JSON.stringify(response)}`)
                signinfo.signVideo = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `签到视频: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} signVideo - 签到视频失败: ${e}`)
                senku.log(`❌ ${cookieName} signVideo - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}


function showmsg(name) {
    return new Promise((resolve, reject) => {
        let subTitle = name
        let detail = ''
        // 签到信息
        if (signinfo.signDay && signinfo.signDay.code == 0) {
            if (signinfo.signDay.data) {
                const amount = signinfo.signDay.data.amount
                amount ? detail += `【签到奖励】获得${amount}💰\n` : detail += ``
            }
        } else subTitle += '签到:失败'

        if (signinfo.signVideo && signinfo.signVideo.code == 0) {
            const amount = signinfo.signVideo.data.amount
            amount ? detail += `【签到视频】获得${amount}💰\n` : detail += ``
        } else subTitle += '签到视频:失败'

        // 骰子信息
        // 次数
        if (signinfo.addnumList.length > 0) {
            detail += `【骰子次数】增加${signinfo.addnumList.length}次\n`
        } else {
            detail += `【骰子次数】无次数增加\n`
        }
        // 掷骰子
        if (signinfo.rollList.length > 0) {
            let i = 0
            for (const roll of signinfo.rollList) {
                i += 1
                roll.code == 0 ? detail += `【骰子奖励】第${i}次获得${roll.data.roll_coin}💰\n` : detail += ``
            }
        } else {
            detail += `【骰子奖励】无次数掷骰子`
        }
        senku.msg(cookieName, subTitle, detail)
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