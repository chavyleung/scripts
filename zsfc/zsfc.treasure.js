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
    const cookie = $request.headers.cookie;

    // 对比 token 是否发生变化
    if ($.read(`zsfc_token`) == matchStr(url, "token")) return;

    // 初始化 dataToWrite 词典，填充待写入内存的键值对
    const dataToWrite = {
      'zsfc_iActivityId': $.read(`zsfc_iActivityId`),  // 掌飞商城无法抓取，只能读取签到页面的脚本获取情况
      "zsfc_accessToken": matchStr(url, "accessToken"),
      "zsfc_openid": matchStr(cookie, "openid"),
      "zsfc_token": matchStr(url, "token"),
      "zsfc_roleId": matchStr(url, "roleId"),
      "zsfc_userId": matchStr(url, "userId"),
      "zsfc_areaId": matchStr(url, "areaId"),
      'zsfc_uin': matchStr(url, "uin"),
      'zsfc_treasure_day': (new Date().getDate()).toString()
    };

    // 将请求数据写入内存
    Object.entries(dataToWrite).forEach(([key, value]) => $.write(value, key));

    // 输出到日志只输出特定的键值对
    // const { zsfc_iActivityId, zsfc_iFlowId, zsfc_accessToken, zsfc_openid } = dataToWrite;
    // $.log({ zsfc_iActivityId, zsfc_iFlowId, zsfc_accessToken, zsfc_openid });
    $.log(dataToWrite)

    // 发送通知
    $.notice($.name, `✅ 获取寻宝数据成功！`, `此脚本需每天打开掌上飞车APP并进入一次寻宝页面`, ``);

  } else {
    // 处理非请求时的逻辑

    // 检查用户今天是否打开过寻宝页面
    const date = (new Date().getDate()).toString();
    if (!$.read(`zsfc_treasure_day`)) $.write(date, `zsfc_treasure_day`);
    if (date != $.read(`zsfc_treasure_day`)) {
      $.log(`❌ 今天未进过寻宝页面`);
      return;
    }

    // 获取地图数据
    $.mapData = await fetchMapData();

    // 尊贵的紫钻用户
    if ($.mapData.isVip) $.log(`💎 尊贵的紫钻用户`);

    // 输出最高解锁星级信息和今日大吉地图
    $.log(`✅ 最高解锁星级：${'⭐️'.repeat($.mapData.starId * 1)}`);
    $.log(`✅ 今日大吉地图：${$.mapData.mapName}`);

    // 开始查询目前的寻宝状态
    treasureData = await performTreasureAction(`start`);

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
    $.write(date, `zsfc_treasure_day`);
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
        const userInfoMatch = data.match(/window\.userInfo\s*=\s*eval\('([^']+)'\);/);
        const mapInfoMatch = data.match(/window\.mapInfo\s*=\s*eval\('([^']+)'\);/);

        const userInfoData = eval(`(${userInfoMatch[1]})`);
        const mapInfoData = eval(`(${mapInfoMatch[1]})`);

        const unlockedStars = Object.keys(userInfoData.starInfo).filter(starId => userInfoData.starInfo[starId] === 1);
        const highestUnlockedStarId = Math.max(...unlockedStars);
        const luckyMap = mapInfoData[highestUnlockedStarId].find(map => map.isdaji === 1);
        const iFlowIdRegex = `${highestUnlockedStarId} == i ${highestUnlockedStarId == 6 ? "&&" : "\\?"} \\(M\\.getLb\\((\\d+), e\\), B\\.getLb\\((\\d+), e\\)\\)`;

        const iFlowIdArrRegex = new RegExp(iFlowIdRegex, 'g');
        const iFlowIdArrMatch = iFlowIdArrRegex.exec(data);
        const iFlowIdArr = iFlowIdArrMatch ? [parseInt(iFlowIdArrMatch[1]), parseInt(iFlowIdArrMatch[2])] : [];

        mapData = {
          starId: highestUnlockedStarId,
          mapId: luckyMap.id,
          isVip: userInfoData.vip_flag,
          mapName: luckyMap.name,
          iFlowId: iFlowIdArr
        };
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
      // "type": $.mapData.isVip + 1,
      "type": "1",  // 懒得检查是否为紫钻了，统统使用普通寻宝
      "areaId": $.read(`zsfc_areaId`),
      "roleId": $.read(`zsfc_roleId`),
      "userId": $.read(`zsfc_userId`),
      "uin": $.read(`zsfc_roleId`),
      "token": $.read(`zsfc_token`)
    })
  };

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
