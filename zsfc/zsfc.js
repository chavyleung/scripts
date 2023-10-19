/**
 *
 * 使用方法：打开掌上飞车APP, 点击咨询栏的签到（每日福利）即可，无需点击签到，否则脚本无法正确运行。
 * 注意事项：每月需手动打开一次掌上飞车APP并进入签到页面，以重新抓包更新礼包数据，为此需要每日运行两次脚本
 *
 * hostname: comm.ams.game.qq.com
 *
 * type: http-request
 * regex: ^https?://comm\.ams\.game\.qq\.com/ams/ame/amesvr*
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
 * requests-body: 1
 *
 * type: cron
 * cron: 0 10 0,21 * * *
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
 *
 * =============== Surge ===============
 * 掌上飞车Cookie = type=http-request, pattern=^https?://comm\.ams\.game\.qq\.com/ams/ame/amesvr*, requires-body=true, max-size=-1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=5
 * 掌上飞车 =type=cron, cronexp="0 10 0,21 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=5
 *
 * =============== Loon ===============
 * http-request ^https?://comm\.ams\.game\.qq\.com/ams/ame/amesvr* script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, requires-body=true, timeout=10, tag=掌上飞车Cookie
 * cron "0 10 0,21 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车
 *
 * =============== Quan X ===============
 * ^https?://comm\.ams\.game\.qq\.com/ams/ame/amesvr* url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
 * 0 10 0,21 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车, enabled=true
 *
*/

/**
 * 创建一个名为 $ 的环境变量实例，用于处理掌上飞车相关操作
 */
const $ = new Env(`🏎️ 掌上飞车`)

/**
 * 检查是否为请求阶段
 */
const isreq = typeof $request !== 'undefined';

/**
 * 主函数，用于执行打卡操作或设置请求数据
 */
(async () => {
  if (isreq) {
    /**
     * 以下获取签到数据
     */

    // 设置触发脚本的间隔时间, 单位为秒
    const interval = 120;
    // 不能触发 requests 脚本，程序终止
    if (Date.now() - $.read(`zsfc_timestamp`) <= interval * 1000) return;

    // 配置错误，弹窗警告并程序终止
    if (!$request.url || !$request.headers || !$request.body) {
      $.notice($.name, '⭕ 无法读取数据', '无法读取掌上飞车请求数据，请检查配置是否正确');
      return;
    }

    // 提取请求数据
    const url = $.toStr($request.url);
    const headers = $.toStr($request.headers);
    const body = $.toStr($request.body);

    // 定义 params 数组
    const params = ['appid', 'iActivityId', 'g_tk', 'e_code', 'g_code', 'eas_url', 'eas_refer', 'sServiceDepartment', 'sServiceType'];
    // 数组有空返回则程序终止
    if (params.find(param => !matchParam(body, param))) return;
    // 用 & 将键值对拼接成一个长字符串
    const param = params.map(param => `${param}=${matchParam(body, param)}`).join('&');

    // 初始化 dataToWrite 词典，填充待写入内存的键值对
    const dataToWrite = {
      'zsfc_url': url.replace(/^"|"$/g, ''),
      'zsfc_headers': headers.replace(/^"|"$/g, ''),
      'zsfc_param': param.replace(/^"|"$/g, ''),
      'zsfc_iFlowId': (matchParam(body, 'iFlowId') - 1).toString(),
      'zsfc_timestamp': Date.now().toString(),
      'zsfc_time': new Date().toLocaleString().toString(),
      'zsfc_month': (new Date().getMonth() + 1).toString()
    };
    // 将请求数据写入内存
    Object.entries(dataToWrite).forEach(([key, value]) => $.write(value, key));

    // 显示签到结果通知
    $.notice($.name, '✅ 获取签到数据成功！', `${interval}秒后请不要再点击本页面中的任何按钮，否则脚本会失效！`);

  } else {
    /**
     * 以下进行签到阶段，但是没有做 cookie 有效性验证
     */

    // 检查用户本月是否打开过签到页面
    const month = (new Date().getMonth() + 1).toString();
    if (!$.read(`zsfc_month`)) $.write(month, `zsfc_month`);
    if (month != $.read(`zsfc_month`)) {
      $.notice($.name, `❌ 本月未打开过掌上飞车APP`, `每月需打开一次掌上飞车APP并进到签到页面`);
      return;
    }

    // 获取本月签到礼物列表
    const signInGifts = await getSignInGifts()

    // 进行每日签到
    await dailyCheckin(signInGifts['每日签到'])

    // 获取本月累签天数
    const totalSignInDay = await getTotalSignInDays()

    // 初始化 signInInfoArray 数组
    let signInInfoArray = [];

    // 判断当前累签天数是否有礼包
    if (signInGifts[`${totalSignInDay}天`]) {
      signInInfoArray.push({ code: signInGifts[`${totalSignInDay}天`], title: `累签奖励` });
    }

    // 判断当前日期是否有特别福利礼包
    const today = `${new Date().getMonth() + 1}月${new Date().getDate()}日`;
    if (signInGifts[today]) {
      signInInfoArray.push({ code: signInGifts[today], title: `特别福利` });
    }

    if (signInInfoArray.length) {
      $.log(`🎉 共有 ${signInInfoArray.length} 个礼包待领取`)
    }

    // 遍历礼包数组，领取奖励
    for (let signInInfo of signInInfoArray) {
      let { code, title } = signInInfo;
      await claimGift(code, title);
    }

    // 显示签到结果通知
    if ($.message) $.notice($.name, $.subtitle, $.message, ``);
    $.write(month, `zsfc_month`);
  }
})()
  .catch((e) => $.notice($.name, '❌ 未知错误无法打卡', e, ''))
  .finally(() => $.done());

/**
 * @description 匹配 BODY 参数
 * @param {string} body - BODY 字符串
 * @param {string} key - 参数名
 * @returns {string}
 */
function matchParam(body, key) {
  const match = body.match(new RegExp(`${key}=([^&]+)`));
  return match ? match[1] : '';
}

/**
 * @description 获取签到信息，并返回签到礼物列表
 * @returns {Promise<Array>} 返回一个包含本月礼物的数组的 Promise。
 */
async function getSignInGifts() {
  const options = {
    url: $.read(`zsfc_url`), headers: $.toObj($.read(`zsfc_headers`)),
    body: `${$.read(`zsfc_param`)}&iFlowId=${$.read(`zsfc_iFlowId`)}`
  };
  $.log(`🧑‍💻 开始获取本月礼物列表`);
  let giftsDictionary = {};
  return new Promise(resolve => {
    $.post(options, (err, resp, data) => {
      if (data) {
        const body = $.toObj(data);
        const flowRegex = /#(\d+)#:{#flow_id#:(\d+),#flow_name#:#([^#]+)#/g;
        let match;
        while ((match = flowRegex.exec($.toStr(body))) !== null) {
          const flowId = match[2];
          const flowName = match[3].replace(/累计签到|领取/g, '');
          giftsDictionary[flowName] = flowId;
        }
        $.log(`✅ 本月共有 ${Object.keys(giftsDictionary).length} 个礼包`)
      } else {
        $.log(`❌ 获取本月礼物列表时发生错误`);
        $.log($.toStr(err));
      }
      resolve(giftsDictionary);
    });
  });
}

/**
 * @description 每日签到函数
 * @param {string} iFlowId - 每日签到礼包的 iFlowId
 * @returns {Promise<Array>} 返回一个包含本月礼物的数组的 Promise。
 */
async function dailyCheckin(iFlowId) {
  const options = {
    url: $.read(`zsfc_url`), headers: $.toObj($.read(`zsfc_headers`)),
    body: `${$.read(`zsfc_param`)}&iFlowId=${iFlowId}`
  };
  $.log(`🧑‍💻 开始进行每日签到`);
  return new Promise(resolve => {
    $.post(options, (err, resp, data) => {
      if (data) {
        let body = $.toObj(data.replace(/\r|\n/ig, ``));
        if (body.msg.includes(`已经`)) {
          const sMsg = body.flowRet.sMsg;
          $.log(`⭕ 领取结果: ${sMsg}`);
          // $.message = `签到结果: ${sMsg}`
        } else {
          const sPackageName = body.modRet.sPackageName;
          $.log(`✅ 领取结果: 获得${sPackageName}`);
          $.message = `恭喜获得：${sPackageName}`
        }
      } else {
        $.log(`❌ 进行每日签到时发生错误`);
        $.log($.toStr(err));
      }
      resolve();
    });
  });
}

/**
 * @description 获取累签天数的情况
 * @returns {Promise<string>} 返回累签天数
 */
async function getTotalSignInDays() {
  let totalSignInDays;
  const options = {
    url: $.read(`zsfc_url`), headers: $.toObj($.read(`zsfc_headers`)),
    body: `${$.read(`zsfc_param`)}&iFlowId=${$.read(`zsfc_iFlowId`) * 1 +1}`
  };
  $.log(`🧑‍💻 开始获取累签天数`);
  return new Promise(resolve => {
    $.post(options, (err, resp, data) => {
      if (data) {
        totalSignInDays = $.toObj(data).modRet.sOutValue1.split(":")[1];
        const missedDays = new Date().getDate() - totalSignInDays;
        const missedDaysText = missedDays !== 0 ? `(漏签 ${missedDays} 天)` : ``;
        $.subtitle = `✅ 累计签到 ${totalSignInDays} 天${missedDaysText}`;
        $.log($.subtitle);
      } else {
        $.log(`❌ 获取累签天数时发生错误`);
        $.log($.toStr(err));
      }
      resolve(totalSignInDays);
    });
  });
}

/**
 * @description 领取礼物函数
 * @param {string} giftId 礼物 ID
 * @param {string} giftName 礼物名称
 */
async function claimGift(giftId, giftName) {
  const options = {
    url: $.read(`zsfc_url`), headers: $.toObj($.read(`zsfc_headers`)),
    body: `${$.read(`zsfc_param`)}&iFlowId=${giftId}`
  };
  $.log(`🧑‍💻 开始领取${giftName}`);
  return new Promise(resolve => {
    $.post(options, (err, resp, data) => {
      if (data) {
        let body = $.toObj(data.replace(/\r|\n/ig, ``));
        if (body.msg.includes(`已经`)) {
          $.log(`⭕ 领取结果: 已经领取`);
          // $.message += `, ${giftName}`;
        } else {
          const sPackageName = body.modRet.sPackageName;
          $.log(`✅ 领取结果: 获得${sPackageName}`);
          if ($.message) {
            $.message += `，${sPackageName}`;
          } else {
            $.message = `领取结果: 获得${sPackageName}`
          }
        }
      } else {
        $.log(`❌ 领取 ${giftName} 时发生错误`);
        $.log($.toStr(err));
      }
      resolve();
    });
  });
}

/**
 * @description 创建一个名为 Env 的构造函数，用于处理环境相关操作。
 * @param {string} name - 环境名称
 */
function Env(name) {
  // 判断当前环境是否为 Loon
  const isLoon = typeof $loon !== "undefined";
  // 判断当前环境是否为 Surge
  const isSurge = typeof $httpClient !== "undefined" && !isLoon;
  // 判断当前环境是否为 QuantumultX
  const isQX = typeof $task !== "undefined";

  // 定义 read 方法，用于读取数据
  const read = (key) => {
    if (isLoon || isSurge) return $persistentStore.read(key);
    if (isQX) return $prefs.valueForKey(key);
  };

  // 定义 write 方法，用于写入数据
  const write = (key, value) => {
    if (isLoon || isSurge) return $persistentStore.write(key, value);
    if (isQX) return $prefs.setValueForKey(key, value);
  };

  // 定义 notice 方法，用于发送通知
  const notice = (title, subtitle, message, url) => {
    if (isLoon) $notification.post(title, subtitle, message, url);
    if (isSurge) $notification.post(title, subtitle, message, { url });
    if (isQX) $notify(title, subtitle, message, { "open-url": url });
  };

  // 定义 get 方法，用于发送 GET 请求
  const get = (url, callback) => {
    if (isLoon || isSurge) $httpClient.get(url, callback);
    if (isQX) {url.method = `GET`; $task.fetch(url).then((resp) => callback(null, {}, resp.body))};
  };

  // 定义 post 方法，用于发送 POST 请求
  const post = (url, callback) => {
    if (isLoon || isSurge) $httpClient.post(url, callback);
    if (isQX) {url.method = `POST`; $task.fetch(url).then((resp) => callback(null, {}, resp.body))};
  };

  // 定义 put 方法，用于发送 PUT 请求
  const put = (url, callback) => {
    if (isLoon || isSurge) $httpClient.put(url, callback)
    if (isQX) {url.method = 'PUT'; $task.fetch(url).then((resp) => callback(null, {}, resp.body))};
  };

  // 定义 toObj 方法，用于将字符串转为对象
  const toObj = (str) => JSON.parse(str);

  // 定义 toStr 方法，用于将对象转为字符串
  const toStr = (obj) => JSON.stringify(obj);

  // 定义 log 方法，用于输出日志
  const log = (message) => console.log(message);

  // 定义 done 方法，用于结束任务
  const done = (value = {}) => $done(value);

  // 返回包含所有方法的对象
  return { name, read, write, notice, get, post, put, toObj, toStr, log, done };
}
