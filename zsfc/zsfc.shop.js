/**
 *
 * 使用方法：打开掌上飞车APP, 点击下方游戏栏，然后点击掌飞商城即可获取所需数据。
 *
 * boxjs订阅地址：https://raw.githubusercontent.com/chiupam/surge/main/boxjs/chiupam.boxjs.json
 *
 * 关于boxjs应用中的道具名称，只能填写以下道具中的其中一个，但我推荐购买改装道具，因为这样可以尽量用光点券
 * 雷诺、进气系统、燃料系统、点火系统、引擎系统、防护装置、普通粒子推进、普通阿尔法离合、重生宝珠LV1、效率宝珠LV1、效率宝珠LV2
 *
 * hostname: bang.qq.com
 *
 * type: http-request
 * regex: ^https?://bang\.qq\.com/app/speed/mall/main2\?*
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.shop.js
 * requests-body: 1
 *
 * type: cron
 * cron: 0 11 0,21 * * *
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.shop.js
 *
 * =============== Surge ===============
 * 掌飞购物Cookie = type=http-request, pattern=^https?://bang\.qq\.com/app/speed/mall/main2\?*, requires-body=1, max-size=-1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.shop.js, script-update-interval=0, timeout=10
 * 掌飞购物 =type=cron, cronexp="0 11 0,21 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.shop.js, script-update-interval=0, timeout=60
 *
 * =============== Loon ===============
 * http-request ^https?://bang\.qq\.com/app/speed/mall/main2\?* script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.shop.js, requires-body=true, timeout=10, tag=掌飞购物Cookie
 * cron "0 11 0,21 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.shop.js, tag=掌飞购物
 *
 * =============== Quan X ===============
 * ^https?://bang\.qq\.com/app/speed/mall/main2\?* url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.shop.js
 * 0 11 0,21 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.shop.js, tag=掌飞购物, enabled=true
 *
 */


/**
 * 创建一个名为 $ 的环境变量实例，用于处理掌飞购物相关操作
 */
const $ = new Env(`🏎️ 掌飞购物`)

/**
 * 检查是否为请求阶段
 */
const isreq = typeof $request !== 'undefined';

/**
 * 主函数，用于执行打卡操作或设置请求数据
 */
(async () => {
  if (isreq) {
    // 处理请求阶段

    const url = $.toStr($request.url).replace(/^"|"$/g, '');  // 提取请求的URL并去除引号

    // 定义需要提取的请求参数
    const paramValue = [
      "roleName", "roleLevel", "roleId", "uin", "nickname", "areaName",
      "serverName", "serverId", "areaId", "isMainRole", "isapp",
      "userId", "token", "appOpenid", "uniqueRoleId", "gameId", "subGameId",
      "cGameId", "roleJob", "secret", "env", "openid", "toOpenid"
    ];

    // 需要添加的附加参数
    const extraParams = {
      steamid: '0', openType: '1', isother: '0', platid: 'false',
      cleId: 'false',  from: 'false', pay_type: '1', isapp: '1'
    };

    // 提取请求中的参数
    const filteredParams = extractParams(url, paramValue);
    const data = generateQueryString({ ...filteredParams, ...extraParams });

    // 提取请求中的引用参数
    const refererValue = [
      "serverName", "appid", "areaName", "roleName", "gameName",
      "nickname", "isMainRole", "appOpenid", "roleId", "areaId",
      "toUin", "roleJob", "serverId", "accessToken", "gameId", "subGameId",
      "token", "cGameId", "uniqueRoleId", "acctype", "accType", "uin",
      "roleLevel", "userId"
    ];

    const filteredReferer = extractParams(url, refererValue);
    const referer = generateQueryString(filteredReferer);

    // 初始化 dataToWrite 词典，填充待写入内存的键值对
    const dataToWrite = {
      'zsfc_bang_url': url,
      'zsfc_bang_referer': referer,
      'zsfc_bang_data': data
    };

    // 将请求数据写入内存
    Object.entries(dataToWrite).forEach(([key, value]) => $.write(value, key));

    // 发送通知
    $.notice($.name, `✅ 获取商城数据成功！`, ``);

  } else {
    // 执行购物阶段

    // 定义商品信息（目前只支持买着下面的东西，因为我懒得爬取了）
    const shopIdArray = {
      "雷诺": {"itemId": "12720", "price_idx": {"180天": {"index": "0", "price": 12200}}}, // 雷诺不购买30天的，有点浪费点券和消费券
      "进气系统": {"itemId": "12377", "price_idx": {"10个": {"index": "0", "price": 3500}, "5个": {"index": "1", "price": 2000}, "1个": {"index": "2", "price": 500}, "50个": {"index": "3", "price": 17500}}},
      "燃料系统": {"itemId": "12378", "price_idx": {"10个": {"index": "0", "price": 3500}, "5个": {"index": "1", "price": 2000}, "1个": {"index": "2", "price": 500}, "50个": {"index": "3", "price": 17500}}},
      "点火系统": {"itemId": "12376", "price_idx": {"10个": {"index": "0", "price": 3500}, "5个": {"index": "1", "price": 2000}, "1个": {"index": "2", "price": 500}, "50个": {"index": "3", "price": 17500}}},
      "引擎系统": {"itemId": "12380", "price_idx": {"10个": {"index": "0", "price": 3500}, "5个": {"index": "1", "price": 2000}, "1个": {"index": "2", "price": 500}, "50个": {"index": "3", "price": 17500}}},
      "防护装置": {"itemId": "96597", "price_idx": {"10个": {"index": "0", "price": 3500}, "5个": {"index": "1", "price": 2000}, "1个": {"index": "2", "price": 500}, "50个": {"index": "3", "price": 17500}}},

      "普通粒子推进": {"itemId": "64025", "price_idx": {"10个": {"index": "0", "price": 3500}, "5个": {"index": "1", "price": 2000}, "1个": {"index": "2", "price": 500}, "50个": {"index": "3", "price": 17500}}},
      "普通阿尔法离合": {"itemId": "65028", "price_idx": {"10个": {"index": "0", "price": 3500}, "5个": {"index": "1", "price": 2000}, "1个": {"index": "2", "price": 500}, "50个": {"index": "3", "price": 17500}}},

      "重生宝珠LV1": {"itemId": "21983", "price_idx": {"3个": {"index": "0", "price": 2600}, "2个": {"index": "1", "price": 1800}, "1个": {"index": "2", "price": 990}, "4个": {"index": "3", "price": 3390}}},
      "效率宝珠LV1": {"itemId": "21977", "price_idx": {"3个": {"index": "0", "price": 2600}, "2个": {"index": "1", "price": 1800}, "1个": {"index": "2", "price": 990}, "4个": {"index": "3", "price": 3390}}},
      "效率宝珠LV2": {"itemId": "21978", "price_idx": {"3个": {"index": "0", "price": 13000}, "2个": {"index": "1", "price": 9000}, "1个": {"index": "2", "price": 4900}, "4个": {"index": "3", "price": 16990}}}
    }

    // 获取当前点券和消费券
    const packBefore = await getPackInfo(`before`);

    // Cookie 已过期，程序终止
    if (!packBefore) {
      $.log(`❌ Cookie 已过期，请重新获取`)
      $.notice($.name, `❌ Cookie 已过期`, `请打开掌上飞车，点击游戏，最后点击掌上商城即可`);
      return;
    }

    // 获取当前余额
    const moneyBefore = packBefore.money * 1;
    const couponsBefore = packBefore.coupons * 1;
    const beforeLog = `✅ 当前共有${moneyBefore}点券，${couponsBefore}消费券`;
    $.log(beforeLog);
    $.subtitle = beforeLog;

    // 读取要购买的商品名称
    shopName = $.read(`zsfc_bang_shopname`);
    if (!shopName) shopName = autoGetGameItem();

    // 获取购物包
    const [shopArray, totalCount] = getShopItems(shopName, shopIdArray[shopName],
      isLastDays(3) ? moneyBefore + couponsBefore : couponsBefore
    );

    // 开始购物循环
    if (shopArray.length) {
      $.log(`✅ 共计可购买${totalCount}个${shopName}`);
      let successBuyCounts = 0;
      let failedBuyCounts = 0;

      // 开始购物
      $.log(`✅ 开始购买${totalCount}个${shopName}`);
      for (let buyInfo of shopArray) {
        let { name, count, id, idx } = buyInfo;
        successBuyCounts += await purchaseItem(name, count, id, idx);
      }
      failedBuyCounts = totalCount - successBuyCounts;

      if (successBuyCounts > 0) {
        $.message = `🎉 成功购买${successBuyCounts}个${shopName}`;
        if (failedBuyCounts > 0) {
          $.message += `（未成功购买${failedBuyCounts}个）`;
        }
      } else {
        $.message = `❌ 全部购买失败，共计${totalCount}个`;
      }
      $.log($.message)

      // 获取剩余余额
      const packAfter = await getPackInfo(`after`);
      const moneyAfter = packAfter.money * 1;
      const couponsAfter = packAfter.coupons * 1;
      const afterLog = `✅ 现在剩余${moneyAfter}点券，${couponsAfter}消费券`;
      $.log(afterLog);
      $.subtitle = afterLog;

    } else {
      $.log(`⭕ 余额不足以购买${shopName}`);
    }

    // 显示购物结果通知
    if ($.message) $.notice($.name, $.subtitle, $.message, ``);

  }
})()
  .catch((e) => $.notice($.name, '❌ 未知错误无法进行购物', e, ''))
  .finally(() => $.done());

/**
  * @description 从字符串中提取参数并返回指定键名的参数值
  * @param {string} str - 包含参数的字符串
  * @param {Array<string>} argument - 需要提取的参数键名
  * @returns {object} 包含提取的参数键值对的对象
  */
function extractParams(str, argument) {
  // 创建正则表达式，用于匹配参数键值对
  const regex = /([^&=]+)=([^&]+)/g;

  // 创建一个空对象，用于存储提取的参数键值对
  const extractedParams = {};

  // 用于迭代匹配参数的正则表达式结果
  let match;

  // 遍历字符串以匹配参数，并将它们存储在 extractedParams 对象中
  while ((match = regex.exec(str))) {
    // 提取参数名
    const paramName = match[1];

    // 提取参数值
    let paramValue = match[2];

    // 将参数键值对存储在 extractedParams 对象中
    extractedParams[paramName] = paramValue;
  }

  // 创建一个空对象，用于存储筛选后的参数键值对
  const filteredParams = {};

  // 遍历需要提取的参数键名
  for (const paramName of argument) {
    // 将符合参数键名的键值对存储在 filteredParams 对象中
    filteredParams[paramName] = extractedParams[paramName];
  }

  // 返回包含筛选后的参数键值对的对象
  return filteredParams;
}

/**
 * @description 生成查询字符串
 * @param {object} argument - 包含键值对的对象
 * @returns {string} 包含 key=value 键值对的查询字符串
 */
function generateQueryString(argument) {
  return Object.entries(argument)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
    .replace(/undefined|"/g, '');
}

/**
 * @description 检查今天是否是当月的最后几天
 * @param {number} N - 要检查的倒数第N天
 * @returns {boolean} true 表示今天是当月的倒数第N天，false 表示反之
 */
function isLastDays(N) {
  // 获取当前日期的 Date 对象
  const today = new Date();

  // 迭代从1到N的整数，用于检查倒数第N天
  for (let i = 1; i <= N; i++) {
    // 创建一个新的 Date 对象，表示明天的日期
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);

    // 检查如果明天的月份不等于今天的月份，则表示今天是当月的倒数第N天
    if (today.getMonth() !== nextDay.getMonth()) {
      return true;
    }
  }

  // 如果没有在循环中返回 true，表示今天不是当月的倒数第N天
  return false;
}

/**
 * @description 获取当前月份对应的游戏道具。
 * @returns {string} 返回当前月份对应的游戏道具名称。
 */
function autoGetGameItem() {
  // 定义游戏道具的列表，包括普通改装道具和进阶改装道具
  const gameItems = [
    "进气系统", "燃料系统", "点火系统", "引擎系统", // 普通改装道具
    // "普通粒子推进", "普通阿尔法离合" // 进阶改装道具，我不需要，注释掉了
  ];

  // 获取当前月份（加1是因为月份从0开始）
  const currentMonth = new Date().getMonth() + 1;

  // 计算当前月份对应的游戏道具的索引
  const index = (currentMonth - 1) % gameItems.length;

  // 返回当前月份对应的游戏道具名称
  return gameItems[index];
}

/**
 * @description 根据当前余额和道具价格生成购物列表
 * @param {string} name - 道具名称
 * @param {object} item - 包含道具价格信息的对象
 * @param {number} money - 当前可用余额
 * @returns {[array, number]} - 一个包含待购物对象和总购物数量的数组
 */
function getShopItems(name, item, money) {
  // 获取道具价格的所有可购买数量，并由高到低排序
  const itemCounts = Object.keys(item.price_idx)
    .map((key) => parseInt(key.match(/\d+/)))
    .filter((num) => !isNaN(num))
    .sort((a, b) => b - a);

  // 获取道具价格的所有价格，并由高到低排序
  const itemPrices = Object.values(item.price_idx)
    .map((priceData) => priceData.price)
    .sort((a, b) => b - a);

  // 初始化总购物数量和购物列表
  let totalCounts = 0;
  let shopArray = [];

  for (let i = 0; i < itemPrices.length; i++) {
    // 计算当前余额可以购买的最大道具数量
    const maxItems = Math.floor(money / itemPrices[i]); // 这是一个计算出的整数，表示根据当前余额和道具价格，最多可以购买的道具数量。
    totalCounts += maxItems * itemCounts[i]; // 这是一个累加的变量，用于跟踪购买的总道具数量。
    money -= maxItems * itemPrices[i]; // 这是当前可用的余额。在每次购买道具后，余额会根据购买的道具数量和价格进行更新，以反映购买后的余额。

    if (maxItems) {
      // 获取当前道具的索引
      const index = item.price_idx[`${itemCounts[i]}天`] || item.price_idx[`${itemCounts[i]}个`];

      // 将可购买的道具添加到购物列表
      for (let m = 0; m < maxItems; m++) {
        shopArray.push({"name": name, "count": itemCounts[i].toString(), "id": item.itemId, "idx": index.index});
      }
    }

    // 如果当前余额不足以购买最便宜的道具，跳出循环
    if (money < itemPrices[itemPrices.length - 1]) {
      break;
    }
  }

  return [shopArray, totalCounts ? totalCounts : 0];
}

/**
 * @description 获取点券和消费券信息
 * @param {string} argument - 余额状态，可选值为 "before" 或 "after"
 * @returns {Promise<object|false>} - 包含点券和消费券数量的对象，或者在获取失败时返回 false
 */
async function getPackInfo(argument) {
  // 创建一个空对象，用于存储点券和消费券信息
  let result = {};

  // 根据参数值设置状态文本
  const statu = (argument === "before") ? "当前" : "剩余";

  // 输出日志，表示开始获取点券和消费券
  $.log(`🧑‍💻 开始获取${statu}点券和消费券`);

  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 GET 请求，获取点券和消费券信息
    $.get({ url: $.read(`zsfc_bang_url`) }, (err, resp, data) => {
      if (data) {
        // 将响应数据转换为字符串
        const body = data.toString();

        // 使用正则表达式匹配点券和消费券数量
        money = body.match(/<b id="super_money">(\d+)<\/b>/)[1];
        coupons = body.match(/<b id="coupons">(\d+)<\/b>/)[1];

        // 将点券和消费券数量存储在结果对象中
        result.money = money;
        result.coupons = coupons;
      } else {
        // 如果获取失败，将结果对象设置为 false
        result = false;
      }

      // 解析 Promise，将结果对象传递给 resolve 函数
      resolve(result);
    });
  });
}

/**
 * @description 购买道具
 * @param {string} name - 道具名称
 * @param {number} count - 购买数量
 * @param {string} id - 道具的唯一标识符
 * @param {string} idx - 道具的价格索引
 * @returns {Promise<number>} - 返回成功购买的道具数量
 */
async function purchaseItem(name, count, id, idx) {
  // 配置请求选项
  const options = {
    url: `https://bang.qq.com/app/speed/mall/getPurchase`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Referer": `https://bang.qq.com/app/speed/mall/detail2?itemId=${id}&${$.read("zsfc_bang_referer")}`
    },
    body: `${$.read(`zsfc_bang_data`)}&commodity_id=${id}&price_idx=${idx}`
  };

  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 POST 请求，购买道具
    $.post(options, (err, resp, data) => {
      if (data) {
        // 将响应数据转换为对象
        const body = $.toObj(data);

        // 提取响应中的消息
        const msg = body.msg;

        // 检查响应结果，如果购买失败，输出错误消息
        if (body.res == -1) {
          $.log(`❌ ${msg}`);
        } else {
          // 如果购买成功，将成功购买的道具数量设置为购买数量
          totalCount = count * 1;
        }
      } else {
        // 如果发生错误，输出错误消息和错误信息
        $.log(`❌ 购买${name}时发生错误`);
        $.log($.toStr(err));
      }

      // 解析 Promise，将成功购买的道具数量传递给 resolve 函数
      resolve(totalCount ? totalCount : 0);
    });
  });
}

/**
 * @description 创建一个名为 Env 的构造函数，用于处理环境相关操作。
 * @param {string} name - 环境名称
 */
function Env(name) {
  // 判断当前环境
  const isLoon = typeof $loon !== "undefined";
  const isSurge = typeof $httpClient !== "undefined" && !isLoon;
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
    if (isQX) { url.method = `GET`; $task.fetch(url).then((resp) => callback(null, {}, resp.body)) };
  };

  // 定义 post 方法，用于发送 POST 请求
  const post = (url, callback) => {
    if (isLoon || isSurge) $httpClient.post(url, callback);
    if (isQX) { url.method = `POST`; $task.fetch(url).then((resp) => callback(null, {}, resp.body)) };
  };

  // 定义 put 方法，用于发送 PUT 请求
  const put = (url, callback) => {
    if (isLoon || isSurge) $httpClient.put(url, callback);
    if (isQX) { url.method = 'PUT'; $task.fetch(url).then((resp) => callback(null, {}, resp.body)) };
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
