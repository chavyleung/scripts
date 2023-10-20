/**
 *
 * 使用方法：打开掌上飞车APP, 点击下方游戏栏，然后点击每日寻宝即可获取所需数据。
 * 注意事项：该脚本未做Cookie失效检测，引测如果运行错误请重新获取所需数据。
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
 * 主函数，用于执行打卡操作或设置请求数据
 */
(async () => {
  if (isreq) {
    // 处理请求时的逻辑

    const url = $request.url;
    const cookie = $request.headers.cookie;

    // 处理所需的键值
    const data = {
      "accessToken": matchStr(cookie, "access_token"),
      "openid": matchStr(cookie, "openid"),
      "token": matchStr(url, "token"),
      "roleId": matchStr(url, "roleId"),
      "userId": matchStr(url, "userId"),
      "areaId": matchStr(url, "areaId")
    };

    // 将数据写入内存
    $.write($.toStr(data), `zsfc_treasure_data`);

    // 发送通知
    $.notice($.name, `✅ 获取寻宝数据成功！`, ``, ``);

  } else {
    // 处理非请求时的逻辑

    // 获取内存数据
    $.memoryData = $.toObj($.read(`zsfc_treasure_data`));

    // 获取地图数据
    $.mapData = await fetchMapData();

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
    } else if (treasureData.timeLeft > 596) {
      $.log(`✅ 开始寻宝，将在${treasureData.timeLeft}秒后结束`);
    } else {
      $.log(`⭕ 正在寻宝中，将在${treasureData.timeLeft}秒后结束`);
    }

    // 这个脚本不发送通知，静默运行
    // $.notice($.name, ``, ``, ``)
  }
})()
  .catch((e) => $.notice($.name, '❌ 未知错误无法打卡', e, ''))
  .finally(() => $.done());

/**
 * 从输入字符串中提取指定关键字的值。
 *
 * @param {string} input - 输入字符串，要从中提取关键字的值。
 * @param {string} key - 要提取的关键字。
 * @returns {string} - 返回匹配到的关键字值，如果没有匹配到则返回空字符串。
 */
function matchStr(input, key) {
  const inputStr = input.toString();
  const separator = inputStr.includes("&") ? "&" : ";";
  const pattern = new RegExp(`${key}=([^${separator}]+)`);
  const match = inputStr.match(pattern);
  return match ? match[1] : '';
}

/**
 * @description 异步获取地图数据操作。
 * @returns {Promise<object>} 包含地图数据的 Promise 对象。
 */
async function fetchMapData() {
  const url = `https://bang.qq.com/app/speed/treasure/index?roleId=${$.memoryData.roleId}&uin=${$.memoryData.roleId}&areaId=${$.memoryData.areaId}`;
  $.log(`🧑‍💻 正在获取地图数据`);
  let mapData = {};

  return new Promise(resolve => {
    $.get(url, (error, response, data) => {
      if (data) {
        // 提取userInfo和mapInfo的数据
        const userInfoMatch = data.match(/window\.userInfo\s*=\s*eval\('([^']+)'\);/);
        const mapInfoMatch = data.match(/window\.mapInfo\s*=\s*eval\('([^']+)'\);/);

        if (userInfoMatch && mapInfoMatch) {
          const userInfoData = eval(`(${userInfoMatch[1]})`);
          const mapInfoData = eval(`(${mapInfoMatch[1]})`);

          const unlockedStars = Object.keys(userInfoData.starInfo)
            .filter(starId => userInfoData.starInfo[starId] === 1);
          const highestUnlockedStarId = Math.max(...unlockedStars);
          const luckyMap = mapInfoData[highestUnlockedStarId]
            .find(map => map.isdaji === 1);

          const iFlowIdArrRegex = new RegExp(`${highestUnlockedStarId} == i \\? \\(M\\.getLb\\((\\d+), e\\), B\\.getLb\\((\\d+), e\\)\\) :`, 'g');
          const iFlowIdArrMatch = iFlowIdArrRegex.exec(data);
          const iFlowIdArr = iFlowIdArrMatch ? [parseInt(iFlowIdArrMatch[1]), parseInt(iFlowIdArrMatch[2])] : [];

          mapData = {
            starId: highestUnlockedStarId,
            mapId: luckyMap.id,
            mapName: luckyMap.name,
            iFlowId: iFlowIdArr
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
      "Cookie": `access_token=${$.memoryData.accessToken}; acctype=qc; appid=1105330667; openid=${$.memoryData.openid}`
    },
    body: $.queryStr({
      "mapId": $.mapData.mapId,
      "starId": $.mapData.starId,
      "areaId": $.memoryData.areaId,
      "roleId": $.memoryData.roleId,
      "userId": $.memoryData.userId,
      "uin": $.memoryData.roleId,
      "token": $.memoryData.token
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
      "Cookie": `access_token=${$.memoryData.accessToken}; acctype=qc; appid=1105330667; openid=${$.memoryData.openid}`
    },
    body: $.queryStr({
      'appid': '1105330667',
      'sArea': $.memoryData.areaId,
      'sRoleId': $.memoryData.roleId,
      'accessToken': $.memoryData.accessToken,
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

function Env(name) {
  const isLoon = typeof $loon !== "undefined";
  const isSurge = typeof $httpClient !== "undefined" && !isLoon;
  const isQX = typeof $task !== "undefined";
  const read = (key) => {
    if (isLoon || isSurge) return $persistentStore.read(key);
    if (isQX) return $prefs.valueForKey(key);
  };
  const write = (key, value) => {
    if (isLoon || isSurge) return $persistentStore.write(key, value);
    if (isQX) return $prefs.setValueForKey(key, value);
  };
  const notice = (title, subtitle, message, url) => {
    if (isLoon) $notification.post(title, subtitle, message, url);
    if (isSurge) $notification.post(title, subtitle, message, { url });
    if (isQX) $notify(title, subtitle, message, { "open-url": url });
  };
  const get = (url, callback) => {
    if (isLoon || isSurge) $httpClient.get(url, callback);
    if (isQX) {url.method = `GET`; $task.fetch(url).then((resp) => callback(null, {}, resp.body))};
  };
  const post = (url, callback) => {
    if (isLoon || isSurge) $httpClient.post(url, callback);
    if (isQX) {url.method = `POST`; $task.fetch(url).then((resp) => callback(null, {}, resp.body))};
  };
  const put = (url, callback) => {
    if (isLoon || isSurge) $httpClient.put(url, callback)
    if (isQX) {url.method = 'PUT'; $task.fetch(url).then((resp) => callback(null, {}, resp.body))};
  };
  const toObj = (str) => JSON.parse(str);
  const toStr = (obj) => JSON.stringify(obj);
  const queryStr = (obj) => {
    const keyValuePairs = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(value);
        keyValuePairs.push(`${encodedKey}=${encodedValue}`);
      }
    }
    return keyValuePairs.join('&');
  };
  const log = (message) => console.log(message);
  const done = (value = {}) => $done(value);
  return { name, read, write, notice, get, post, put, toObj, toStr, queryStr, log, done };
}
