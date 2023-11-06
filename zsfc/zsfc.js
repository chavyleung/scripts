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
const isRequest = typeof $request !== 'undefined';

/**
 * 构建请求的部分参数
 */
const option = {
  url: `https://comm.ams.game.qq.com/ams/ame/amesvr?iActivityId=${$.read(`zsfc_iActivityId`)}`,
  headers: {
    "Cookie": `access_token=${$.read(`zsfc_accessToken`)}; acctype=qc; appid=1105330667; openid=${$.read(`zsfc_openid`)}`
  }
};

/**
 * 主函数，用于执行签到操作或设置请求数据
 */
(async () => {
  if (isRequest) {
    /**
     * 以下获取签到数据
     */

    // 提取请求数据
    const cookie = $request.headers.cookie;
    const body = $request.body;

    // 提取请求体中的 iActivityId 和 iFlowId 作为检验使用
    $.iActivityId = matchParam(body, 'iActivityId');
    $.iFlowId = matchParam(body, 'iFlowId') - 1;

    // 初始化 cookieToWrite 词典，填充待写入内存的键值对
    const cookieToWrite = {
      'zsfc_accessToken': matchParam(cookie, 'accessToken'),
      'zsfc_openid': matchParam(cookie, 'openId')
    };

    // 将请求数据写入内存
    Object.entries(cookieToWrite).forEach(([key, value]) => $.write(value, key));

    // 发起请求检验 iActivityId 和 iFlowId 是否为需要的值，如果返回的对象中不存在任何一个键值对则立即终止程序
    if (!Object.keys(await getSignInGifts()).length) return;

    // 初始化 dataToWrite 词典，填充待写入内存的键值对
    const dataToWrite = {
      'zsfc_iActivityId': ($.iActivityId).toString(),
      'zsfc_iFlowId': ($.iFlowId).toString(),
      'zsfc_month': (new Date().getMonth() + 1).toString()
    }

    // 如果所有键值都与内存中的值相同，则立即终止程序
    if (Object.keys(dataToWrite).every(key => dataToWrite[key] === $.read(key))) return;

    // 将请求数据写入内存，并输出到日志中
    Object.entries(dataToWrite).forEach(([key, value]) => $.write(value, key));
    $.log(dataToWrite)

    // 显示获取结果通知
    $.notice($.name, `✅ 获取签到数据成功`, `流水ID：${$.iFlowId}，活动ID：${$.iActivityId}`);

    // 检查并设置青龙相关变量
    if ($.read(`ql_url`) && $.read(`ql_client_id`) && $.read(`ql_client_secret`) && $.toObj($.read(`zsfc_upload_id`))) {
      const qlUrlCache = $.read(`ql_url`);
      $.qlUrl = qlUrlCache.charAt(qlUrlCache.length - 1) === '/' ? qlUrlCache.slice(0, -1) : qlUrlCache;
      $.qlId = $.read(`ql_client_id`);
      $.qlSecret = $.read(`ql_client_secret`);
      $.qlToken = await qlToken();

      const qlEnvsName = `ZSFC_iFlowdId`;
      const qlEnvsValue = `${$.iFlowId}/${$.iActivityId}`;
      const qlEnvsRemarks = `掌飞签到`;

      // 获取青龙面板令牌，若成功则执行后续操作
      if ($.qlToken) {
        const qlEnvsNewBody = await qlEnvsSearch(qlEnvsName, qlEnvsValue, qlEnvsRemarks);
        if (!qlEnvsNewBody) return;  // 环境变量的值没有发生变化，不需要进行操作

        // 检查并处理环境变量的返回值类型
        if (Array.isArray(qlEnvsNewBody)) {
          // 暂时无法完成新增操作，后续再修改
          $.log(`⭕ 手动添加名为 ${qlEnvsName} 变量`);
        } else {
          await qlEnvsEdit(qlEnvsNewBody);
        }
      } else {
        $.log("❌ 无法获取 token，请检查青龙相关配置");
      }
    }
  } else {
    /**
     * 以下进行签到阶段，但是没有做 cookie 有效性验证
     */

    // 检查用户本月是否打开过签到页面
    const month = (new Date().getMonth() + 1).toString();
    if (month != $.read(`zsfc_month`)) {
      $.notice($.name, `❌ 本月未打开过掌上飞车APP`, `每月需打开一次掌上飞车APP并进到签到页面`);
      return;
    }

    // 获取本月签到礼物列表
    const signInGifts = await getSignInGifts();

    // 进行每日签到
    await dailyCheckin(option, signInGifts['每日签到']);

    // 获取本月累签天数
    const totalSignInDay = await getTotalSignInDays(option);

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
      $.log(`🎉 共有 ${signInInfoArray.length} 个礼包待领取`);
    }

    // 遍历礼包数组，领取奖励
    for (let signInInfo of signInInfoArray) {
      let { code, title } = signInInfo;
      await claimGift(option, code, title);
    }

    // 显示签到结果通知
    if ($.message) $.notice($.name, $.subtitle, $.message, ``);
  }
})()
  .catch((e) => $.notice($.name, '❌ 未知错误无法打卡', e, ''))
  .finally(() => $.done());

/**
 * @description 匹配 BODY 参数
 * @param {string} body - BODY 字符串
 * @param {string} key - 参数名
 * @returns {string} 返回匹配到的字符串或空值
 */
function matchParam(input, key) {
  const separator = input.includes("&") ? "&" : ";";
  const pattern = new RegExp(`${key}=([^${separator}]+)`);
  const match = input.match(pattern);
  return match ? match[1] : '';
}

/**
 * @description 获取签到信息，并返回签到礼物列表
 * @returns {Promise<Array>} 返回一个包含本月礼物的数组的 Promise。
 */
async function getSignInGifts() {
  const options = {
    url: `https://comm.ams.game.qq.com/ams/ame/amesvr?iActivityId=${isRequest ? $.iActivityId : $.read(`zsfc_iActivityId`)}`,
    headers: {
      "Cookie": `access_token=${$.read(`zsfc_accessToken`)}; acctype=qc; appid=1105330667; openid=${$.read(`zsfc_openid`)}`
    },
    body: $.queryStr({
      "iActivityId": isRequest ? $.iActivityId : $.read(`zsfc_iActivityId`),
      "g_tk": "1842395457",
      "sServiceType": "speed",
      "iFlowId": isRequest ? $.iFlowId : $.read(`zsfc_iFlowId`)
    })
  };
  if (!isRequest) $.log(`🧑‍💻 开始获取本月礼物列表`)
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
        if (!isRequest) {
          $.log(`✅ 本月共有 ${Object.keys(giftsDictionary).length} 个礼包`);
        }
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
 * @param {object} option - 部分请求对象
 * @param {string} iFlowId - 每日签到礼包的 iFlowId
 */
async function dailyCheckin(option, iFlowId) {
  const options = option;
  options.body = $.queryStr({
    "iActivityId": $.read(`zsfc_iActivityId`),
    "g_tk": "1842395457",
    "sServiceType": "speed",
    "iFlowId": iFlowId
  });
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
          $.message = `恭喜获得：${sPackageName}`;
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
 * @param {object} option - 部分请求对象
 * @returns {Promise<string>} 返回累签天数
 */
async function getTotalSignInDays(option) {
  const options = option;
  options.body = $.queryStr({
    "iActivityId": $.read(`zsfc_iActivityId`),
    "g_tk": "1842395457",
    "sServiceType": "speed",
    "iFlowId": $.read(`zsfc_iFlowId`) * 1 + 1
  });
  let totalSignInDays;
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
 * @param {object} option - 部分请求对象
 * @param {string} giftId 礼物 ID
 * @param {string} giftName 礼物名称
 */
async function claimGift(option, giftId, giftName) {
  const options = option;
  options.body += `&iFlowId=${giftId}`;
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
 * @description 获取青龙面板令牌
 * @returns {Promise<string|boolean>} 返回一个包含青龙面板令牌或布尔值的 Promise。
 */
async function qlToken() {
  let accessToken; // 更具体的变量名，表示访问令牌
  const options = {
    url: `${$.qlUrl}/open/auth/token?client_id=${$.qlId}&client_secret=${$.qlSecret}`
  };
  return new Promise(resolve => {
    $.get(options, (err, resp, data) => {
      if (data) {
        const responseBody = $.toObj(data);
        if (responseBody.code === 200) {
          accessToken = responseBody.data.token;
        } else {
          accessToken = false;
        }
      }
      resolve(accessToken);
    });
  });
}

/**
 * @description 搜索环境变量并生成新的请求体部分参数
 * @param {string} envsName - 新环境变量的名称
 * @param {string} envsValue - 新环境变量的具体值
 * @param {string} envsRemarks - 新环境变量的备注名
 * @returns {Promise<object|Array|boolean>} 返回一个请求体对象或列表或布尔值的 Promise。
 */
async function qlEnvsSearch(envsName, envsValue, envsRemarks) {
  let requestPayload; // 代表请求体的变量名更具体
  const options = {
    url: `${$.qlUrl}/open/envs?searchValue=${envsName}`,
    headers: { "Authorization": `Bearer ${$.qlToken}` }
  };
  return new Promise(resolve => {
    $.get(options, (err, resp, data) => {
      if (data) {
        const responseBody = $.toObj(data).data;
        if (responseBody.length === 1) {
          // 找到匹配的环境变量，生成单个请求体对象
          const matchingEnv = responseBody[0];
          if (matchingEnv.value === envsValue) {
            requestPayload = false;
          } else {
            requestPayload = {
              'id': matchingEnv.id,
              'name': envsName,
              'value': envsValue,
              'remarks': envsRemarks
            };
          }
        } else {
          // 未找到匹配的环境变量，生成包含一个对象的数组
          requestPayload = [{
            'name': envsName,
            'value': envsValue,
            'remarks': envsRemarks
          }];
        }
      }
      resolve(requestPayload);
    });
  });
}

/**
 * @description 编辑青龙面板的环境变量
 * @param {object} data - 请求参数
 */
async function qlEnvsEdit(data) {
  const options = {
    url: `${$.qlUrl}/open/envs`,
    headers: { "Authorization": `Bearer ${$.qlToken}` },
    body: data
  };
  return new Promise(resolve => {
    // 判断请求方法（post还是put）
    const requestMethod = Array.isArray(data) ? $.post : $.put;
    requestMethod(options, (err, resp, responseData) => {
      if (responseData) {
        let body = $.toObj(responseData);
        // 根据返回的状态码处理结果
        if (body.code !== 200) {
          $.log(`❌ 上传青龙面板失败`);
        }
      }
      resolve(); // 完成Promise
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

  // 定义 queryStr 方法，用于将对象转为可以请求的字符串
  const queryStr = (obj) => {
    return Object.keys(obj)
      .map(key => `${key}=${obj[key]}`)
      .join('&');
  };

  // 定义 log 方法，用于输出日志
  const log = (message) => console.log(message);

  // 定义 done 方法，用于结束任务
  const done = (value = {}) => $done(value);

  // 返回包含所有方法的对象
  return { name, read, write, notice, get, post, put, toObj, toStr, queryStr, log, done };
}
