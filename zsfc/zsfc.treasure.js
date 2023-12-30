/**
 *
 * 使用方法：打开掌上飞车APP, 点击下方游戏栏，然后点击每日寻宝即可获取所需数据。
 * 注意事项：目前只能每天打开掌飞并进入寻宝页面进行寻宝，非常麻烦，准备弃坑~
 *
 * hostname: bang.qq.com
 *
 * type: http-request
 * regex: ^https?://bang\.qq\.com/app/speed/treasure/index\?*
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js
 * requests-body: 1
 *
 * type: cron
 * cron: 0 0 11-16/1 * * *
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js
 *
 * =============== Surge ===============
 * 掌飞寻宝Cookie = type=http-request, pattern=^https?://bang\.qq\.com/app/speed/treasure/index\?*, requires-body=true, max-size=-1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, script-update-interval=0, timeout=60
 * 掌飞寻宝 =type=cron, cronexp="0 0 11-16/1 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, script-update-interval=0, timeout=30
 *
 * =============== Loon ===============
 * http-request ^https?://bang\.qq\.com/app/speed/treasure/index\?* script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, requires-body=true, timeout=60, tag=掌飞寻宝Cookie
 * cron "0 0 11-16/1 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, tag=掌飞寻宝
 *
 * =============== Quan X ===============
 * ^https?://bang\.qq\.com/app/speed/treasure/index\?* url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js
 * 0 0 11-16/1 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, tag=掌飞寻宝, enabled=true
 *
 */

/**
 * 创建一个名为 $ 的环境变量实例，用于处理掌飞寻宝相关操作
 */
const $ = new Env(`🏎️ 掌飞寻宝`)

/**
 * 检查是否为请求阶段
 */
const isreq = typeof $request !== 'undefined';

/**
 * 主函数，用于执行寻宝操作或设置请求数据
 */
(async () => {
  if (isreq) {
    // 处理请求时的逻辑

    // 提取请求的URL和其他数据
    const url = $request.url;
    const cookie = $request.headers.cookie || $request.headers.Cookie;  // QX、Loon都是用的Cookie

    // 对比 token 是否发生变化
    // if ($.read(`zsfc_token`) === matchStr(url, "token")) return;

    // 初始化 dataToWrite 词典，填充待写入内存的键值对
    const dataToWrite = {
      'zsfc_iActivityId': $.read(`zsfc_iActivityId`),  // 掌飞寻宝无法抓取，只能读取签到页面的脚本获取情况
      "zsfc_accessToken": matchStr(url, "accessToken"),
      "zsfc_openid": matchStr(cookie, "openid"),
      "zsfc_token": matchStr(url, "token"),
      "zsfc_roleId": matchStr(url, "roleId"),
      "zsfc_userId": matchStr(url, "userId"),
      "zsfc_areaId": matchStr(url, "areaId"),
      'zsfc_uin': matchStr(url, "uin"),
      // 'zsfc_day': (new Date().getDate()).toString()
    };

    // 将请求数据写入内存
    Object.entries(dataToWrite).forEach(([key, value]) => $.write(value, key));

    // 写入日志并发送通知
    if ($.toObj($.read(`zsfc_treasure_log`) || `true`)) {
      $.log(dataToWrite);
      $.notice($.name, `✅ 获取寻宝数据成功！`, `此脚本需每天打开掌上飞车APP并进入一次寻宝页面`, ``);
    }

    // 检查并设置青龙相关变量
    if ($.read(`ql_url`) && $.read(`ql_client_id`) && $.read(`ql_client_secret`) && $.toObj($.read(`zsfc_upload_config`))) {
      const qlUrlCache = $.read(`ql_url`);
      $.qlUrl = qlUrlCache.charAt(qlUrlCache.length - 1) === '/' ? qlUrlCache.slice(0, -1) : qlUrlCache;
      $.qlId = $.read(`ql_client_id`);
      $.qlSecret = $.read(`ql_client_secret`);
      $.qlToken = await qlToken();

      const qlEnvsName = `ZSFC_CONFIG`;
      const qlEnvsValue = $.toStr(dataToWrite);
      const qlEnvsRemarks = `掌飞商城`;

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
    // 处理非请求时的逻辑

    /**
     * 2023.12.15 发现iOS端重开掌飞不会使token过期，因此无需检测
     */
    // 检查用户今天是否打开过寻宝页面
    // const date = (new Date().getDate()).toString();
    // if (date != $.read(`zsfc_day`)) return $.log(`❌ 今天未进过寻宝页面`);

    // 获取地图数据
    $.mapData = await fetchMapData();
    if (!Object.keys($.mapData).length) return $.log(`❌ 无法获取地图信息`);
    if (!$.mapData.remainingTimes) return $.log(`⭕ 当天的寻宝次数已用完`);

    // 尊贵的紫钻用户
    if ($.mapData.isVip) $.log(`💎 尊贵的紫钻用户`);

    // 输出最高解锁星级信息和今日大吉地图
    $.log(`✅ 最高解锁星级：${'⭐️'.repeat($.mapData.starId * 1)}`);
    $.log(`✅ 今日大吉地图：${$.mapData.mapName}`);

    // 等待当前分钟数除以5的秒数时间
    // await wait((new Date().getMinutes()) / 5);

    // 开始查询目前的寻宝状态
    treasureData = await performTreasureAction(`start`);
    // if (!treasureData.timeLeft) return $.log(`❌ 无法获取寻宝状态`);

    if (treasureData.ending) {
      // 寻宝完成，先结束寻宝再领取奖励
      $.log(`🧑‍💻 结束在${$.mapData.mapName}中寻宝`);
      treasureData = await performTreasureAction(`end`);

      // 循环领取两个寻宝奖励
      for (let iFlowId of $.mapData.iFlowId) {
        $.log(`✅ 恭喜你获得：${await claimTreasureReward(iFlowId)}`);
      }

      // 今天还能寻宝，继续寻宝
      if (treasureData.todaycanTimes) {
        $.log(`💨 还剩余${treasureData.todaycanTimes}次寻宝机会，继续寻宝`);
        await performTreasureAction(`start`);
      }
    } else if (!treasureData.todaycanTimes) {
      $.log(`⭕ 当天的寻宝次数已用完`);
    } else if (treasureData.timeLeft > 597) {
      $.log(`✅ 开始寻宝，将在${treasureData.timeLeft}秒后结束`);
    } else {
      $.log(`⭕ 正在寻宝中，将在${treasureData.timeLeft}秒后结束`);
    }

    // 这个脚本不发送通知，静默运行
    // $.notice($.name, ``, ``, ``);
  }
})()
  .catch((e) => $.notice($.name, '❌ 未知错误无法寻宝', e, ''))
  .finally(() => $.done());

/**
 * 从输入字符串中提取指定关键字的值。
 *
 * @param {string} input - 输入字符串，要从中提取关键字的值。
 * @param {string} key - 要提取的关键字。
 * @returns {string} - 返回匹配到的关键字值，如果没有匹配到则返回空字符串。
 */
function matchStr(input, key) {
  const separator = input.includes("&") ? "&" : ";";
  const pattern = new RegExp(`${key}=([^${separator}]+)`);
  const match = input.match(pattern);
  return match ? match[1] : '';
}

/**
 * @description 等待一段时候。
 * @param {number} s - 等待时长。
 * @returns {Promise} Promise
 */
 async function wait(s) {
  $.log(`💤 程序休眠 ${s}s 后继续...`);
  return new Promise((resolve) => {
    setTimeout(resolve, s * 1000);
  });
}

/**
 * @description 异步获取地图数据操作。
 * @returns {Promise<object>} 包含地图数据的 Promise 对象。
 */
async function fetchMapData() {
  const params = {
    'roleId': $.read(`zsfc_roleId`),
    'uin': $.read(`zsfc_uin`),
    'areaId': $.read(`zsfc_areaId`),
  };
  const url = `https://bang.qq.com/app/speed/treasure/index?${$.queryStr(params)}`;
  $.log(`🧑‍💻 正在获取地图数据`);
  let mapData = {};

  return new Promise(resolve => {
    $.get(url, (error, response, data) => {
      if (data) {
        // 提取userInfo和mapInfo的数据
        const [userInfoData, mapInfoData, todaycanTimes, todayTimes] = [
          data.match(/window\.userInfo\s*=\s*eval\('([^']+)'\);/)?.[1],
          data.match(/window\.mapInfo\s*=\s*eval\('([^']+)'\);/)?.[1],
          data.match(/"todaycanTimes":(\d+)/)?.[1],
          data.match(/"todayTimes":(\d+)/)?.[1]
        ].map(match => match && eval(`(${match})`));

        // 判断今日可寻宝次数是否用完
        if ((todaycanTimes - todayTimes)) { // 次数没有用完
          // 固定 iFlowId 列表
          const iFlowIdArray = {
            "1": ["856152", "856155"],  // 1星
            "2": ["856156", "856157"],  // 2星，100次
            "3": ["856158", "856159"],  // 3星，300次
            "4": ["856160", "856161"],  // 4星，500次
            "5": ["856162", "856163"],  // 5星，紫钻地图
            "6": ["856164", "856165"]   // 6星，皇族地图
          };

          // 获取地图最高解锁星级
          const highestUnlockedStarId = Math.max(
            ...Object.keys(userInfoData.starInfo)  // 转化为数组
            .filter(starId => userInfoData.starInfo[starId] === 1)
          );

          // 获取大吉地图信息
          const luckyMap = mapInfoData[highestUnlockedStarId]
            .find(map => map.isdaji === 1);

          mapData = {
            remainingTimes: true,
            starId: highestUnlockedStarId,
            mapId: luckyMap.id,
            isVip: userInfoData.vip_flag,
            mapName: luckyMap.name,
            iFlowId: iFlowIdArray[highestUnlockedStarId]
          };
        } else { // 次数已经用完
          mapData = {
            remainingTimes: false
          };
        }
      } else {
        $.log(`❌ 获取地图数据时发生错误`);
        $.log($.toStr(error));
      }

      resolve(mapData);
    });
  });
}

/**
 * @description 异步执行寻宝操作。
 * @param {string} action - 操作动作，可以是 "start" 或 "end"。
 * @returns {Promise<object>} - 包含操作结果的相关信息的 Promise 对象。
 */
async function performTreasureAction(action) {
  let isEnding = 0;
  let timeRemaining = 0;
  let remainingTimes = 1;
  let digTreasureData = {};

  const options = {
    url:`https://bang.qq.com/app/speed/treasure/ajax/${action}DigTreasure`,
    headers: {
      "Referer": "https://bang.qq.com/app/speed/treasure/index",
      "Cookie": `access_token=${$.read(`zsfc_accessToken`)}; acctype=qc; appid=1105330667; openid=${$.read(`zsfc_openid`)}`
    },
    body: $.queryStr({
      "mapId": $.mapData.mapId,
      "starId": $.mapData.starId,
      // 普通寻宝1 600s -- 快捷寻宝2 10s
      "type": $.mapData.isVip ? 2 : 1,
      "areaId": $.read(`zsfc_areaId`),
      "roleId": $.read(`zsfc_roleId`),
      "userId": $.read(`zsfc_userId`),
      "uin": $.read(`zsfc_roleId`),
      "token": $.read(`zsfc_token`)
    })
  };

  // 发送 POST 异步请求并返回一个 Promise 对象
  return new Promise(resolve => {
    $.post(options, (error, response, data) => {
      if (data) {
        const body = $.toObj(data);
        if (action === "start") {
          if (body.msg.includes(`用完`)) {
            remainingTimes = 0;
          } else {
            const targetTimestamp = new Date(body.data.time).getTime();
            const tenMinutesLaterTimestamp = targetTimestamp + 10 * 60 * 1000;
            if (Date.now() > tenMinutesLaterTimestamp) {
              isEnding = 1;
            } else {
              timeRemaining = parseInt((tenMinutesLaterTimestamp - Date.now()) / 1000);
            }
          }
        } else {
          remainingTimes = body.data.todaycanTimes - body.data.todayTimes
        }

        digTreasureData = {
          ending: isEnding,
          timeLeft: timeRemaining,
          todaycanTimes: remainingTimes
        };
      } else {
        $.log(`❌ 寻宝时发生错误`);
        $.log($.toStr(error));
      }

      resolve(digTreasureData);
    });
  });
}

/**
 * @description 异步执行领取寻宝奖励操作。
 * @param {number} flowId - 寻宝流水ID，用于标识领取的奖励。
 * @returns {Promise<string>} - 包含领取的奖励包名的 Promise 对象。
 */
async function claimTreasureReward(flowId) {
  let sPackageName;

  const options = {
    url: `https://act.game.qq.com/ams/ame/amesvr?ameVersion=0.3&iActivityId=468228`,
    headers: {
      "Cookie": `access_token=${$.read(`zsfc_accessToken`)}; acctype=qc; appid=1105330667; openid=${$.read(`zsfc_openid`)}`
    },
    body: $.queryStr({
      'appid': '1105330667',
      'sArea': $.read(`zsfc_areaId`),
      'sRoleId': $.read(`zsfc_roleId`),
      'accessToken': $.read(`zsfc_accessToken`),
      'iActivityId': "468228",
      'iFlowId': flowId,
      'g_tk': '1842395457',
      'sServiceType': 'bb'
    })
  }

  return new Promise(resolve => {
    $.post(options, (error, response, data) => {
      if (data) {
        sPackageName = $.toObj(data).modRet.sPackageName;
      } else {
        $.log(`❌ 领取寻宝奖励时发生错误`);
        $.log($.toStr(error));
      }
      resolve(sPackageName);
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
  $.log(options.body)
  return new Promise(resolve => {
    // 判断请求方法（post还是put）
    const requestMethod = Array.isArray(data) ? $.post : $.put;
    requestMethod(options, (err, resp, responseData) => {
      if (responseData) {
        let body = $.toObj(responseData);
        // 根据返回的状态码处理结果
        if (body.code !== 200) {
          $.log(`❌ 上传青龙面板失败`);
          $.log(body)
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
