/**
 * 
 * 使用方法：打开掌上飞车APP, 点击下方发现, 点击每日签到, 点击签到即可。
 * 
 * hostname: mwegame.qq.com
 * 
 * type: http-request
 * regex: ^https://mwegame\.qq\.com/ams/sign/doSign/month
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
 * requests-body: 1
 * 
 * type: cron
 * cron: 0 10 0 * * *
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
 * 
 * =============== Surge ===============
 * 掌上飞车Cookie = type=http-request, pattern=^https://mwegame\.qq\.com/ams/sign/doSign/month, requires-body=1, max-size=-1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=5
 * 掌上飞车 =type=cron, cronexp="0 10 0 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=5
 * 
 * =============== Loon ===============
 * http-request ^https://mwegame\.qq\.com/ams/sign/doSign/month script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, requires-body=true, timeout=10, tag=掌上飞车Cookie
 * cron "0 10 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车
 * 
 * =============== Quan X ===============
 * ^https://mwegame\.qq\.com/ams/sign/doSign/month url scripts-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
 * 0 10 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车, enabled=true
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
    // 请求阶段，设置请求数据
    if (!$request.url || !$request.headers) {
      // 无法读取请求头，显示配置错误通知
      $.notice($.name, '', '⭕ 无法读取请求头, 请检查配置');
      return;
    }

    // 提取请求数据
    const url = $request.url.replace(/&gift_id=\d+/, '');
    const headers = $.toStr($request.headers);
    const query = [
      `userId=${matchParam(url, 'userId')}`,
      `areaId=${matchParam(url, 'areaId')}`,
      `roleId=${matchParam(url, 'roleId')}`,
      `token=${matchParam(url, 'token')}`,
      `uin=${matchParam(url, 'uin')}`,
    ].join('&');

    // 将请求数据写入内存
    $.write(url, 'zsfc_url');
    $.write(headers, 'zsfc_headers');
    $.write(query, 'zsfc_query');

    $.notice($.name, '✅ 获取签到数据成功！', '请不要再次打开掌上飞车APP, 否则 Cookie 将失效！');
  } else {
    // 执行打卡操作阶段
    const url = $.read('zsfc_url');
    const query = $.read('zsfc_query');
    const illustrate = `掌上飞车APP => 发现 => 每日签到 => 点击签到`;

    if (!url) {
      // Cookie 为空，显示获取Cookie错误通知
      $.notice($.name, '❌ 当前 Cookie 为空, 请先获取', illustrate);
      return;
    }

    if (query.indexOf('&areaId=&') !== -1) {
      // Cookie 错误，显示重新获取Cookie错误通知
      $.notice($.name, '❌ 当前 Cookie 错误, 请重新获取', illustrate);
      return;
    }

    // 获取连续签到的礼物ID
    const successiveGiftId = await getSuccessiveGiftId();
    // 进行连续签到
    const isSuccessiveCheckin = await dailyCheckin(successiveGiftId);

    if (!isSuccessiveCheckin) {
      // Cookie 失效，显示重新获取Cookie错误通知
      $.notice($.name, '❌ 当前 Cookie 已失效, 请重新获取', illustrate);
      return;
    }

    // 获取签到信息数组
    signInInfoArray = await getSignInInfo();

    // 遍历签到信息数组，领取每日礼物
    for (let signInInfo of signInInfoArray) {
      let { code, title } = signInInfo;
      await claimGift(code, title);
    }

    // 显示签到结果通知
    $.notice(`${$.name}(${$.subtitle})`, ``, $.message, ``)

  }
})()
  .catch((e) => $.notice($.name, '❌ 未知错误无法打卡', e, ''))
  .finally(() => $.done());

/**
 * 匹配 URL 参数
 * @param {string} url - URL 字符串
 * @param {string} key - 参数名
 * @returns {string}
 */
function matchParam(url, key) {
  const match = url.match(new RegExp(`${key}=([^&]+)`));
  return match ? match[1] : '';
}

/**
 * 获取连续签到的礼物 ID
 * @returns {Promise<string>} 返回连续签到的礼物 ID
 */
async function getSuccessiveGiftId() {
  // 用于保存连续签到的礼物 ID
  let giftid;

  // 构造请求参数
  const options = {
    url: `https://mwegame.qq.com/ams/sign/month/speed?${$.read(`zsfc_query`)}`,
    headers: $.toObj($.read(`zsfc_headers`))
  };

  // 发送 GET 请求，获取签到页面信息
  return new Promise(resolve => {
    $.get(options, (err, resp, data) => {
      if (data) {
        // 解析响应数据，提取礼物 ID
        giftid = data.match(/giftid="([^"]+)"/g)[0].match(/(\d+)/)[1];
      }
      resolve(giftid);
    });
  });
}

/**
 * 每日签到函数
 * @param {string} giftId 礼物 ID
 * @returns {Promise<boolean>} 返回签到结果，true 表示签到成功，false 表示签到失败
 */
async function dailyCheckin(giftId) {
  // 初始化签到结果为 false
  let result = false;

  // 构造请求参数
  const options = {
    url: `${$.read("zsfc_url")}&gift_id=${giftId}`,
    headers: $.toObj($.read(`zsfc_headers`))
  };

  // 输出日志，开始每日签到
  $.log(`🧑‍💻 开始每日签到`);

  // 发送 GET 请求，进行签到
  return new Promise(resolve => {
    $.get(options, (err, resp, data) => {
      if (data) {
        // 解析响应数据
        let body = $.toObj(data.replace(/\r|\n/ig, ``));
        let message = body.message;

        if (message.indexOf(`重试`) > -1) {
          // Cookie 失效，签到失败
          $.log(`❌ 当前 Cookie 已失效, 请重新获取`);
          $.message = ``;
        } else if (message.indexOf(`已经`) > -1) {
          // Cookie 有效，再次签到
          result = true;
          $.log(`⭕ 签到结果: ${message}`);
          $.message = `签到结果: ${message}`;
        } else {
          // Cookie 有效，签到成功
          result = true;
          $.log(`✅ ${body.send_result.sMsg.replace("：", ":")}`);
          $.message = body.send_result.sMsg.replace("：", ":");
        }
      } else {
        // 发生错误，签到失败
        $.log(`❌ 进行每日签到时发生错误`);
        $.log($.toStr(err));
      }
      resolve(result);
    });
  });
}

/**
 * @description 获取签到信息，并返回签到礼物列表
 * @returns {Promise<Array>} 一个返回包含签到礼物的数组的 Promise。
 */
async function getSignInInfo() {
  // 获取当前时间
  const date = new Date();

  // 设置请求参数
  const options = {
    url: `https://mwegame.qq.com/ams/sign/month/speed?${$.read(`zsfc_query`)}`,
    headers: $.toObj($.read(`zsfc_headers`))
  }

  // 输出日志，开始获取累计签到天数
  $.log(`🧑‍💻 开始获取累计签到天数`);

  // 初始化 signInGifts 为空列表
  let signInGifts = [];

  // 发送 GET 请求，获取签到信息
  return new Promise(resolve => {
    $.get(options, (err, resp, data) => {
      if (data) {
        // 定义一个数组，用于将累计签到天数映射到礼物编号
        const giftIndexByDay = [
          0, // 占位，第一个元素不是第一天
          1, 2, 3, 0, 4, 0, 5, 0, 6, 7,
          8, 0, 9, 0, 10, 11, 0, 12, 13, 0,
          14, 15, 0, 0, 16, 0, 0, 0, 0, 0, 0
        ];

        // 使用正则表达式获取累计签到天数
        const totalSignInDays = Number(data.match(/<span id="my_count">(\d+)<\/span>/)?.[1]);
        $.subtitle = `累计签到 ${totalSignInDays} 天`;
        $.log(`✅ ${$.subtitle}`);

        // 根据累计签到天数获取礼物编号，并将其添加到 signInGifts 中
        const giftIndex = giftIndexByDay[totalSignInDays];
        const giftCode = giftIndex ? data.match(/giftid="([^"]+)"/g)[giftIndex].match(/(\d+)/)[1] : null;
        if (giftIndex && giftCode) signInGifts.push({ code: giftCode, title:  `第 ${giftIndexByDay.indexOf(giftIndex)} 天奖励` });

        // 获取当前日期的日数，并检查是否为每月的第 X 天，如果是则将礼物编号添加到 signInGifts 中
        const [matchMonthDay] = data.match(/月(\d+)日/g) || [];
        const [, day] = matchMonthDay?.match(/(\d+)/) || [];
        if (day && Number(day) === date.getDate()) {
          const giftDays = data.match(/"giftdays([^"]+)"/g)[0].match(/(\d+)/)[1];
          const dayWelfare = `${date.getMonth() + 1}月${date.getDate()}日`;
          signInGifts.push({ code: giftDays, title: ` ${dayWelfare} 特别福利` });
        }

      } else {
        // 发生错误，输出错误日志
        $.log(`❌ 获取累计签到天数时发生错误`);
        $.log($.toStr(err));
      }
      // 将 signInGifts 作为 Promise 的返回值，以便在调用方使用
      resolve(signInGifts);
    });
  });
}

/**
 * 领取礼物函数
 * @param {string} giftId 礼物 ID
 * @param {string} giftName 礼物名称
 */
async function claimGift(giftId, giftName) {
  // 设置请求参数
  const options = {
    url: `https://mwegame.qq.com/ams/send/handle`,
    headers: $.toObj($.read(`zsfc_headers`)),
    body: `${$.read(`zsfc_query`)}&gift_id=${giftId}`
  };

  // 输出日志，开始领取礼物
  $.log(`🧑‍💻 开始领取${giftName}`);

  // 发送 POST 请求，领取礼物
  return new Promise(resolve => {
    $.post(options, (err, resp, data) => {
      if (data) {
        let result = $.toObj(data.replace(/\r|\n/ig, ``));
        if (result.data.indexOf(`成功`) != -1) {
          // 领取成功，获取礼物名称并记录日志
          const sPackageName = result.send_result.sPackageName;
          $.log(`✅ 领取结果: 获得${sPackageName}`);
          $.message += `, ${sPackageName}`;
        } else {
          // 领取失败，记录错误信息日志
          $.log(`⭕ 领取结果: ${result.message}`);
        }
      } else {
        // 发生错误，输出错误日志
        $.log(`❌ 开始领取${giftName}时发生错误`);
        $.log($.toStr(err));
      }
      resolve();
    });
  })
}

/**
 * 创建一个名为 Env 的构造函数，用于处理环境相关操作。
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
