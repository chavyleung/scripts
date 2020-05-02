// 赞赏:邀请码`A1040276307`
// 链接`http://html34.qukantoutiao.net/qpr2/bBmQ.html?pid=5eb14518`
// 农妇山泉 -> 有点咸

const DeleteCookie = false // 清除Cookie,将下方改为true,默认false

const bind = true // 绑定作者邀请码,默认true,可更改为false

const cookieName = '米读'
const senku = init()

function initial() {
    signinfo = {
        addnumList: [],
        rollList: [],
        doubleList: [],
        drawPrizeList: []
    }
}


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

bind ? '' : senku.setdata('', 'bind');;
(sign = () => {
    senku.log(`🔔 ${cookieName}`)
    senku.getdata('tokenMidu_sign') ? '' : senku.msg('米读签到', '', '不存在Cookie')
    DualAccount = true
    if (senku.getdata('tokenMidu_sign')) {
        signbodyVal = senku.getdata('senku_signbody_midu')
        all()
    }

    senku.done()
})().catch((e) => senku.log(`❌ ${cookieName} 签到失败: ${e}`), senku.done())

async function all() {
    senku.log(`🍎${signbodyVal}`)
    const key = signbodyVal
    initial()
    await userInfo(key)
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
    await prizeInfo(key)
    if (signinfo.prizeInfo) {
        const total_num = signinfo.prizeInfo.data.total_num
        for (let index = 0; index < total_num; index++) {
            await drawPrize(key)
            await prizeTask(key)
        }
    }
    if (senku.getdata('bind')) {
        await Bind()
    }
    await showmsg()
}

function double() {
    initial()
    DualAccount = false
    if (senku.getdata('tokenMidu_sign2')) {
        signbodyVal = senku.getdata('senku_signbody_midu2')
        all()
    }
}

// 绑定
function Bind() {
    return new Promise((resolve, reject) => {
        const BindurlVal = 'http://fisson.1sapp.com/nlx/shareLink/tmpBind'
        const url = {
            url: BindurlVal,
            headers: {},
            body: 'app_id=7&act_type=1&act_name=grad_pupil&invite_code=A1040276307&telephone=' + signinfo.userInfo.data.mobile
        }
        url.headers['Host'] = 'fisson.1sapp.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            senku.setdata('', 'bind')
            resolve()
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

// 抽奖
function drawPrize(bodyVal) {
    return new Promise((resolve, reject) => {
        const drawPrizeurlVal = 'https://apiwz.midukanshu.com/wz/task/drawPrize?' + bodyVal
        const url = {
            url: drawPrizeurlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} drawPrize - response: ${JSON.stringify(response)}`)
                signinfo.drawPrizeList.push(JSON.parse(data))
                resolve()
            } catch (e) {
                senku.msg(cookieName, `抽奖: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} drawPrize - 抽奖失败: ${e}`)
                senku.log(`❌ ${cookieName} drawPrize - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 观看视频获取抽奖机会
function prizeTask(bodyVal) {
    return new Promise((resolve, reject) => {
        const prizeTaskurlVal = 'https://apiwz.midukanshu.com/wz/task/prizeTask?' + bodyVal
        const url = {
            url: prizeTaskurlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} prizeTask - response: ${JSON.stringify(response)}`)
                signinfo.prizeTask = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `观看视频抽奖: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} prizeTask - 观看视频抽奖失败: ${e}`)
                senku.log(`❌ ${cookieName} prizeTask - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 抽奖信息
function prizeInfo(bodyVal) {
    return new Promise((resolve, reject) => {
        const prizeInfourlVal = 'https://apiwz.midukanshu.com/wz/task/prizeList?' + bodyVal
        const url = {
            url: prizeInfourlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} prizeInfo - response: ${JSON.stringify(response)}`)
                signinfo.prizeInfo = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `抽奖信息: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} prizeInfo - 抽奖信息失败: ${e}`)
                senku.log(`❌ ${cookieName} prizeInfo - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}
// 骰子信息
function dice_index(bodyVal) {
    return new Promise((resolve, reject) => {
        const dice_index_urlVal = 'https://apiwz.midukanshu.com/wz/dice/index?' + bodyVal
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
function dice_roll(bodyVal) {
    return new Promise((resolve, reject) => {
        const dice_roll_urlVal = 'https://apiwz.midukanshu.com/wz/dice/roll?' + bodyVal
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
function dice_double(bodyVal) {
    return new Promise((resolve, reject) => {
        const dice_double_urlVal = 'https://apiwz.midukanshu.com/wz/dice/doubleReward?' + bodyVal
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
function dice_addnum(bodyVal) {
    return new Promise((resolve, reject) => {
        const dice_addnum_urlVal = 'https://apiwz.midukanshu.com/wz/dice/addChangeNumByRewardVideo?' + bodyVal
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
function signDay(bodyVal) {
    return new Promise((resolve, reject) => {
        const signurlVal = 'https://apiwz.midukanshu.com/wz/task/signInV2?' + bodyVal
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
function signVideo(bodyVal) {
    return new Promise((resolve, reject) => {
        const signVideourlVal = 'https://apiwz.midukanshu.com/wz/task/signVideoReward?' + bodyVal
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


function showmsg() {
    return new Promise((resolve, reject) => {
        let subTitle = ``
        let detail = ''
        // 签到信息
        if (signinfo.signDay && signinfo.signDay.code == 0) {
            if (signinfo.signDay.data) {
                const amount = signinfo.signDay.data.amount
                amount ? detail += `【签到奖励】获得${amount}💰\n` : detail += `【签到奖励】已获取过奖励\n`
            }
        } else subTitle += '签到:失败'

        if (signinfo.signVideo && signinfo.signVideo.code == 0) {
            const amount = signinfo.signVideo.data.amount
            amount ? detail += `【签到视频】获得${amount}💰\n` : detail += `【签到视频】已获取过奖励\n`
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
                roll.code == 0 ? detail += `【骰子奖励】第${i}次获得${roll.data.roll_coin}💰\n` : detail += `【骰子奖励】已获取过奖励\n`
            }
        } else {
            detail += `【骰子奖励】无次数掷骰子\n`
        }

        // 大转盘抽手机
        if (signinfo.drawPrizeList.length > 0) {
            let i = 0
            for (const drawPrize of signinfo.drawPrizeList) {
                i += 1
                drawPrize.data.index >= 0 ? detail += `【转盘奖励】第${i}次获得${drawPrize.data.title}\n` : detail += `【转盘奖励】已获取过奖励`
            }
        } else {
            detail += `【转盘奖励】无次数抽奖`
        }
        senku.msg(cookieName + ` 用户:${signinfo.userInfo.data.nickname}`, subTitle, detail)
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