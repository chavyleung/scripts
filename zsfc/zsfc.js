/**
 *
 * 使用方法：打开掌上飞车APP, 点击咨询栏的签到（每日福利）即可，无需点击签到，然后点击下方游戏栏，最后点击掌飞商城即可获取所需商城数据。
 * 注意事项：1、每月需手动打开一次掌上飞车APP并进入签到页面，以重新抓包更新礼包数据，为此需要每日运行两次脚本；2、如果账号信息没有发生根本性变化的话，抓取 Cookie 等信息的脚本就不会被执行；3、如需购买掌飞商店中的指定商品，请订阅boxjs链接，并在掌上飞车应用中填写在售商品的完整名称
 *
 * boxjs订阅地址：https://raw.githubusercontent.com/chiupam/surge/main/boxjs/chiupam.boxjs.json
 *
 * 
 * hostname: comm.ams.game.qq.com
 *
 * type: http-request
 * regex: ^https?://(comm\.ams\.game\.qq\.com/ams/ame/amesvr*|bang\.qq\.com/app/speed/mall/main2\?*)
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
 * requests-body: 1
 *
 * type: cron
 * cron: 0 10 0,21 * * *
 * script-path: https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
 *
 * =============== Surge ===============
 * 掌上飞车Cookie = type=http-request, pattern=^https?://(comm\.ams\.game\.qq\.com/ams/ame/amesvr*|bang\.qq\.com/app/speed/mall/main2\?*), requires-body=true, max-size=-1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=5
 * 掌上飞车 =type=cron, cronexp="0 10 0,21 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=60
 *
 * =============== Loon ===============
 * http-request ^https?://(comm\.ams\.game\.qq\.com/ams/ame/amesvr*|bang\.qq\.com/app/speed/mall/main2\?*) script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, requires-body=true, timeout=60, tag=掌上飞车Cookie
 * cron "0 10 0,21 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车
 *
 * =============== Quan X ===============
 * ^https?://(comm\.ams\.game\.qq\.com/ams/ame/amesvr*|bang\.qq\.com/app/speed/mall/main2\?*) url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
 * 0 10 0,21 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车, enabled=true
 *
*/

/**
 * 创建一个名为 $ 的环境变量实例，用于处理掌上飞车相关操作
 */
const $ = new Env()

/**
 * 检查是否为请求阶段
 */
const isRequest = typeof $request !== 'undefined';

/**
 * 主函数，用于执行签到操作或设置请求数据
 */
(async () => {
  if (isRequest) {

    if ($request.url.includes(`amesvr`)) {
      /**
       * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 以下获取签到数据 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
       */

      // 提取请求数据
      const cookie = $request.headers.cookie || $request.headers.Cookie;  // QX、Loon都是用的Cookie
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

      // 发起请求检验 iActivityId 和 iFlowId 是否为需要的值
      if (!Object.keys(await getSignInGifts()).length || !(await getTotalSignInDays())) return;

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
      $.notice(`🏎️ 掌上飞车`, `✅ 获取签到数据成功！`, `流水ID：${$.iFlowId}，活动ID：${$.iActivityId}`);

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
       * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 以下获取商城数据 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
       */

      // 提取请求的URL并去除引号
      const url = $.toStr($request.url).replace(/^"|"$/g, '');
      const cookie = $request.headers.cookie || $request.headers.Cookie;  // QX、Loon都是用的Cookie

      // 对比 token 是否发生变化
      if ($.read(`zsfc_token`) === matchParam(url, "token")) return;

      // 初始化 dataToWrite 词典，填充待写入内存的键值对
      const dataToWrite = {
        'zsfc_iActivityId': $.read(`zsfc_iActivityId`),  // 掌飞商城无法抓取，只能读取签到页面的脚本获取情况
        "zsfc_accessToken": matchParam(url, "accessToken"),
        "zsfc_openid": matchParam(cookie, "openid"),
        "zsfc_token": matchParam(url, "token"),
        "zsfc_roleId": matchParam(url, "roleId"),
        "zsfc_userId": matchParam(url, "userId"),
        "zsfc_areaId": matchParam(url, "areaId"),
        'zsfc_uin': matchParam(url, "uin"),
      };

      // 将请求数据写入内存
      Object.entries(dataToWrite).forEach(([key, value]) => $.write(value, key));

      // 输出到日志只输出特定的键值对
      // const { zsfc_iActivityId, zsfc_iFlowId, zsfc_accessToken, zsfc_openid } = dataToWrite;
      // $.log({ zsfc_iActivityId, zsfc_iFlowId, zsfc_accessToken, zsfc_openid });
      $.log(dataToWrite)

      // 发送通知
      $.notice(`🏎️ 掌飞购物`, `✅ 获取商城数据成功！`, `请不要再次打开掌上飞车APP, 否则商城 Cookie 将失效！`);

    }

  } else {
    /**
     * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 以下进行签到阶段 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
     */

    // 检查用户本月是否打开过签到页面
    const month = (new Date().getMonth() + 1).toString();
    if (month != $.read(`zsfc_month`)) return $.notice(`🏎️ 掌上飞车`, `❌ 本月未打开过掌上飞车APP`, `每月需打开一次掌上飞车APP并进到签到页面`);

    // 获取本月签到礼物列表
    const signInGifts = await getSignInGifts();

    // 进行每日签到
    await dailyCheckin(signInGifts['每日签到']);

    // // 获取本月累签天数
    const totalSignInDay = await getTotalSignInDays();

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
      await claimGift(code, title);
    }

    // 显示签到结果通知
    if ($.checkInMsg && $.toObj($.read(`zsfc_treasure_log`) || `true`)) $.notice(`🏎️ 掌上飞车`, $.subtitle, $.checkInMsg, ``);


    /**
     * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 以下进行购物阶段 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
     */

    // 读取到设置不进行购物
    if (!$.toObj($.read(`zsfc_shop`))) return $.log(`⭕ 设置为不执行购物`);

    // 读取到没有获取过商城数据
    if (!$.read(`zsfc_token`)) return $.notice(`🏎️ 掌飞购物`, `❌ 请先获取商城数据`, `打开掌上飞车，点击游戏并进入掌上商城`);

    // 获取当前点券和消费券
    const packBefore = await getPackInfo(`before`);

    // Cookie 已过期，程序终止
    if (!packBefore) return $.log(`❌ Cookie 已过期，请重新获取`), $.notice(`🏎️ 掌飞购物`, `❌ Cookie 已过期`, `打开掌上飞车，点击游戏并进入掌上商城`);

    // 读取要购买的商品名称并生成商品列表
    const shopName = $.read(`zsfc_bang_shopname`) || autoGetGameItem();
    const shopIdArray = await searchShop(shopName);

    // 无法在掌上商城中搜索到相关商品时终止程序
    if (!Object.keys(shopIdArray).length) return $.notice(`🏎️ 掌飞购物`, `❌ ${shopName} 未在商店中售卖`, `请在掌上商城中认真核对商品名称`);

    // 获取当前余额
    const beforeLog = `✅ 当前共有${packBefore.money}点券，${packBefore.coupons}消费券`;
    $.log(beforeLog);
    $.subtitle = beforeLog;

    // 获取购物包
    const [shopArray, totalCount, unit] = getShopItems(shopIdArray, packBefore);

    // 开始购物循环
    if (shopArray.length) {
      let successBuyCounts = 0;
      let failedBuyCounts = 0;

      const estimatedBydCounts = totalCount === 999 ? "1个" : totalCount;
      const caption = totalCount === 999 ? "永久" : unit;

      $.log(`✅ 预计可购买${estimatedBydCounts}${caption}${shopName}`);

      // 开始购物
      for (let buyInfo of shopArray) {
        let { count, id, idx } = buyInfo;
        successBuyCounts += await purchaseItem(shopName, count, id, idx);
      }

      if (successBuyCounts > 0) {
        // 购买永久道具后为避免重复购买自动禁用购买脚本并重置道具名称
        if (totalCount === 999) $.write(`false`, `zsfc_shop`), $.write(``, `zsfc_bang_shopname`);

        $.shopMsg = `🎉 成功购买${estimatedBydCounts}${caption}${shopName}`;
        failedBuyCounts = estimatedBydCounts - successBuyCounts;
        if (failedBuyCounts > 0) {
          $.shopMsg += `（未成功购买${failedBuyCounts}${caption}）`;
        }
      } else {
        $.shopMsg = `❌ 全部购买失败，共计${estimatedBydCounts}${caption}${shopName}`;
      }
      $.log($.shopMsg)

      // 获取剩余余额
      const packAfter = await getPackInfo(`after`);
      const afterLog = `✅ 现在剩余${packAfter.money}点券，${packAfter.coupons}消费券`;
      $.log(afterLog);
      $.subtitle = afterLog;

    } else {
      $.log(`⭕ 余额不足以购买${shopName}`);
    }

    // 显示购物结果通知
    if ($.shopMsg && $.toObj($.read(`zsfc_treasure_log`) || `true`)) $.notice(`🏎️ 掌飞购物`, $.subtitle, $.shopMsg, ``);

  }
})()
  .catch((e) => $.notice(`🏎️ 掌上飞车`, '❌ 未知错误无法执行', e, ''))
  .finally(() => $.done());

/**
 * 从输入字符串中提取指定关键字的值。
 *
 * @param {string} input - 输入字符串，要从中提取关键字的值。
 * @param {string} key - 要提取的关键字。
 * @returns {string} - 返回匹配到的关键字值，如果没有匹配到则返回空字符串。
 */
function matchParam(input, key) {
  const separator = input.includes("&") ? "&" : ";";
  const pattern = new RegExp(`${key}=([^${separator}]+)`);
  const match = input.match(pattern);
  return match ? match[1] : '';
}

/**
 * @description 掌飞购物相关函数，获取当前月份对应的游戏道具。
 * @returns {string} 返回当前月份对应的游戏道具名称。
 */
function autoGetGameItem() {
  // 定义游戏道具的列表，包括普通改装道具和进阶改装道具
  const gameItems = [
    "进气系统+1", "燃料系统+1", "点火装置+1", "引擎装置+1", // 普通改装道具
    // "普通粒子推进", "普通阿尔法离合" // 进阶改装道具，我不需要，注释掉了
  ];

  // 计算当前月份对应的游戏道具的索引
  const index = new Date().getMonth() % gameItems.length;

  // 返回当前月份对应的游戏道具名称
  return gameItems[index];
}

/**
 * @description 掌飞购物相关函数，获取商店物品信息。
 * @param {object} shopInfo - 商店信息对象
 * @param {object} overage - 用户余额对象
 * @returns {[array, number, str]} - 返回购买的物品数组、总数和单位信息的数组
 */
function getShopItems(shopInfo, overage) {
  // 获取今天的日期和本月剩余天数是否小于3天（月底3天的计算方式不可以为小于等于3）
  const today = new Date();
  const day = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const lastDay = (day - today.getDate()) < 3;

  // 创建一个包含商店信息和物品数据的对象
  const info = {"Id": shopInfo.iId, "data": []};

  // 判断商店类型并获取相应的物品数值
  const shopType = shopInfo.szItems[0].ItemNum !== "";  // 表示购买的商品是按数量购买
  const values = shopType ? shopInfo.szItems[0].ItemNum : shopInfo.szItems[0].ItemAvailPeriod;

  // 将物品数值转换成数组
  const numArray = values.split(',').filter(item => item !== '').map((item) => {
    if (item === "-1") return 999;
    return shopType ? parseInt(item) : parseInt(item) / 24;
  });

  // 根据价格排序物品数据
  const sortedData = shopInfo.szPrices.map((price, index) => ({
    price: parseInt(price.SuperMoneyPrice), count: numArray[index], idx: index
  })).sort((a, b) => b.count - a.count);

  // 将排序后的数据存入 info 对象
  sortedData.forEach(({ price, count, idx }) => {
    info.data.push({ count, price, idx });
  });

  // 初始化购买总数、物品数组和投入金额
  let totalCount = 0;
  let items = [];
   let remMoney = lastDay ? overage.money + overage.coupons : overage.coupons;

  const data = info.data;
  const lastOne = data.length - 1;

  for (let m = 0; m < data.length; m++) {
    let pushCounts = 0;
    let itemIndex = data[m].idx;

    // 判断是否购买永久物品
    if (data[m].count === 999 && remMoney > data[m].price) {
      items.push({"count": 999, "id": info.Id, "idx": itemIndex});
      totalCount = data[m].count;
      info.unit = "永久";
      break;
    }

    // 计算最大可购买的物品数量并更新总数和剩余金钱
    const maxPurchasableItems = Math.floor(remMoney / data[m].price);  // 这是一个计算出的整数，表示根据当前余额和道具价格，最多可以购买的道具数量。
    thisTimeCost = maxPurchasableItems * data[m].price;  // 这是一个累加的变量，用于跟踪本轮循环购买道具的总花费。
    totalCount += maxPurchasableItems * data[m].count; // 这是一个累加的变量，用于跟踪购买的总道具数量。
    remMoney -= maxPurchasableItems * data[m].price; // 这是当前可用的余额。在每次购买道具后，余额会根据购买的道具数量和价格进行更新，以反映购买后的余额。

    // 将购买的物品加入数组
    for (let n = 0; n < maxPurchasableItems; n++) {
      items.push({"count": data[m].count, "id": info.Id, "idx": itemIndex, "cost": data[m].price});
      pushCounts += 1;
    }

    // 在购买数量道具情况下，非月尾判断是否可以购买最后一个物品
    if (remMoney < data[lastOne].price && !lastDay && shopType) {
      const meetsThreshold = remMoney > data[lastOne].price / Number(`1000000`);
      const canAffordLastItem = remMoney + overage.money >= data[lastOne].price;

      // 如果满足阈值条件，且消费券加点券的和大于最便宜一个道具的价格
      if (meetsThreshold && canAffordLastItem) {
        items.push({"count": data[lastOne].count, "id": info.Id, "idx": data[lastOne].idx, "cost": data[lastOne].price});
        pushCounts += 1;
        totalCount += data[lastOne].count;
        thisTimeCost += data[lastOne].price;
      }

      // 本轮花费大于0且本轮消费等于倒数第二阶梯的消费价格时，清空本轮添加的购买包
      if (thisTimeCost !== 0 && thisTimeCost === data[m - 1].price) {
        // 计算需要保留的元素数量
        const itemsToKeep = items.length - pushCounts;

        // 计算新的元素序列
        const newIndex = lastOne - 1;

        // 使用 slice 创建一个新数组，仅保留需要的元素
        items = items.slice(0, itemsToKeep);

        // 添加新元素到数组末尾
        items.push({
          "count": data[newIndex].count,
          "id": info.Id,
          "idx": data[newIndex].idx,
          "cost": data[newIndex].price
        });
      }

      break;
    }
  }

  return [items, totalCount, shopType ? "个" : "天"];
}

/**
 * @description 掌飞签到相关函数，获取签到信息，并返回签到礼物列表
 * @returns {Promise<Array>} 返回一个包含本月礼物的数组的 Promise。
 */
async function getSignInGifts() {
  // 初始化礼包词典
  let giftsDictionary = {};

  // 构建请求体
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

  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 POST 请求，获取本月所有礼包情况
    $.post(options, (err, resp, data) => {
      if (data) {
        const body = $.toObj(data);
        const flowRegex = /#(\d+)#:{#flow_id#:(\d+),#flow_name#:#([^#]+)#/g;

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
 * @description 掌飞签到相关函数，每日签到函数
 * @param {string} iFlowId - 每日签到礼包的 iFlowId
 */
async function dailyCheckin(iFlowId) {
  // 构建请求体
  const options = {
    url: `https://comm.ams.game.qq.com/ams/ame/amesvr?iActivityId=${$.read(`zsfc_iActivityId`)}`,
    headers: {
      "Cookie": `access_token=${$.read(`zsfc_accessToken`)}; acctype=qc; appid=1105330667; openid=${$.read(`zsfc_openid`)}`
    },
    body: $.queryStr({
      "iActivityId": $.read(`zsfc_iActivityId`),
      "g_tk": "1842395457",
      "sServiceType": "speed",
      "iFlowId": iFlowId
    })
  };

  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 POST 请求，获取今日签到结果
    $.post(options, (err, resp, data) => {
      if (data) {
        const body = $.toObj(data.replace(/\r|\n/ig, ``));

        if (body.msg.includes(`已经`)) {
          const sMsg = body.flowRet.sMsg;
          $.log(`⭕ 领取结果: ${sMsg}`);
          // $.checkInMsg = `签到结果: ${sMsg}`
        } else {
          const sPackageName = body.modRet.sPackageName;
          $.log(`✅ 领取结果: 获得${sPackageName}`);
          $.checkInMsg = `恭喜获得：${sPackageName}`;
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
 * @description 掌飞签到相关函数，获取累签天数的情况
 * @returns {Promise<string>} 返回累签天数
 */
async function getTotalSignInDays() {
  // 初始化总签到天数
  let totalSignInDays;

  // 构建请求体
  const options = {
    url: `https://comm.ams.game.qq.com/ams/ame/amesvr?iActivityId=${isRequest ? $.iActivityId : $.read(`zsfc_iActivityId`)}`,
    headers: {
      "Cookie": `access_token=${$.read(`zsfc_accessToken`)}; acctype=qc; appid=1105330667; openid=${$.read(`zsfc_openid`)}`
    },
    body: $.queryStr({
      "iActivityId": isRequest ? $.iActivityId : $.read(`zsfc_iActivityId`),
      "g_tk": "1842395457",
      "sServiceType": "speed",
      "iFlowId": Number(isRequest ? $.iFlowId : $.read(`zsfc_iFlowId`)) + 1
    })
  };

  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 POST 请求，获取累签天数
    $.post(options, (err, resp, data) => {
      if (data) {
        try {
          totalSignInDays = $.toObj(data).modRet.sOutValue1.split(":")[1];
          const missedDays = new Date().getDate() - totalSignInDays;
          const missedDaysText = missedDays !== 0 ? `(漏签 ${missedDays} 天)` : ``;

          if (!isRequest) {
            $.subtitle = `✅ 累计签到 ${totalSignInDays} 天${missedDaysText}`;
            $.log($.subtitle);
          }
        } catch {}
      } else {
        $.log(`❌ 获取累签天数时发生错误`);
        $.log($.toStr(err));
      }
      resolve(!isNaN(totalSignInDays) ? totalSignInDays : false);
    });
  });
}

/**
 * @description 掌飞签到相关函数，领取礼物函数
 * @param {string} giftId 礼物 ID
 * @param {string} giftName 礼物名称
 */
async function claimGift(giftId, giftName) {
  // 构建请求体
  const options = {
    url: `https://comm.ams.game.qq.com/ams/ame/amesvr?iActivityId=${$.read(`zsfc_iActivityId`)}`,
    headers: {
      "Cookie": `access_token=${$.read(`zsfc_accessToken`)}; acctype=qc; appid=1105330667; openid=${$.read(`zsfc_openid`)}`
    },
    body: $.queryStr({
      "iActivityId": $.read(`zsfc_iActivityId`),
      "g_tk": "1842395457",
      "sServiceType": "speed",
      "iFlowId": giftId
    })
  };

  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 POST 请求，获取领取结果
    $.post(options, (err, resp, data) => {
      if (data) {
        let body = $.toObj(data.replace(/\r|\n/ig, ``));
        if (body.msg.includes(`已经`)) {
          $.log(`⭕ 领取结果: 已经领取`);
          // $.checkInMsg += `, ${giftName}`;
        } else {
          const sPackageName = body.modRet.sPackageName;
          $.log(`✅ 领取结果: 获得${sPackageName}`);
          if ($.checkInMsg) {
            $.checkInMsg += `，${sPackageName}`;
          } else {
            $.checkInMsg = `领取结果: 获得${sPackageName}`
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
 * @description 掌飞购物相关函数，根据商品名称搜索商品信息
 * @param {string} shopName - 要搜索的商品名称
 * @returns {Promise<Object>} 包含商品信息的 Promise 对象
 */
async function searchShop(shopName) {
  // 初始化目标商品对象
  let targetShopObject = {};

  // 获取 URL 中的查询参数
  const params = {
    'uin': $.read(`zsfc_uin`),
    'userId': $.read(`zsfc_userId`),
    'token': $.read(`zsfc_token`),
    'start': '0',
    'paytype': '1',  // 按点券筛选
    'order': '2', // 按点券筛选
    'text': encodeURIComponent(shopName)
  };

  // 构建请求体
  const options = {
    url: `https://bang.qq.com/app/speed/mall/search?${$.queryStr(params)}`,
    headers: { Referer: `https://bang.qq.com/app/speed/mall/main2` },
  };

  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 POST 请求，获取商品信息
    $.post(options, (err, resp, data) => {
      if (data) {
        const body = $.toObj(data);
        targetShopObject = body.data.find(item => item.szName === shopName);
      }
      // 解析 Promise，将结果对象传递给 resolve 函数
      resolve(targetShopObject);
    });
  });
}

/**
 * @description 掌飞购物相关函数，获取点券和消费券信息
 * @param {string} argument - 余额状态，可选值为 "before" 或 "after"
 * @returns {Promise<object|false>} - 包含点券和消费券数量的对象，或者在获取失败时返回 false
 */
async function getPackInfo(argument) {
  // 创建一个空对象，用于存储点券和消费券信息
  let result = {};

  // 根据参数值设置状态文本
  const statu = (argument === "before") ? "当前" : "剩余";

  // 获取 URL 中的查询参数
  const params = {
    'areaId': $.read(`zsfc_areaId`),
    'accessToken': $.read(`zsfc_accessToken`),
    'token': $.read(`zsfc_token`),
    'uin': $.read(`zsfc_uin`),
    'userId': $.read(`zsfc_userId`),
  };

  // 构建请求体
  const options = {
    url: `https://bang.qq.com/app/speed/mall/main2?${$.queryStr(params)}`
  };

  // 输出日志，表示开始获取点券和消费券
  if (statu === "before") $.log(`🧑‍💻 开始获取${statu}点券和消费券`);

  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 GET 请求，获取点券和消费券信息
    $.get(options, (err, resp, data) => {
      if (data) {
        // 将响应数据转换为字符串
        const body = data.toString();

        // 使用正则表达式匹配点券和消费券数量
        money = body.match(/<b id="super_money">(\d+)<\/b>/)[1];
        coupons = body.match(/<b id="coupons">(\d+)<\/b>/)[1];

        // 将点券和消费券数量存储在结果对象中
        result.money = Number(money);
        result.coupons = Number(coupons);
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
 * @description 掌飞购物相关函数，购买道具
 * @param {string} name - 道具名称
 * @param {number} count - 购买数量
 * @param {string} id - 道具的唯一标识符
 * @param {string} idx - 道具的价格索引
 * @returns {Promise<number>} - 返回成功购买的道具数量
 */
async function purchaseItem(name, count, id, idx) {
  // 构建请求体
  const options = {
    url: `https://bang.qq.com/app/speed/mall/getPurchase`,
    headers: {
      "Referer": `https://bang.qq.com/app/speed/mall/detail2`
    },
    body: $.queryStr({
      'areaId': $.read(`zsfc_areaId`),
      'token': $.read(`zsfc_token`),
      'userId': $.read(`zsfc_userId`),
      'uin': $.read(`zsfc_uin`),
      'pay_type': "1",
      'commodity_id': id,
      'price_idx': idx
    })
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
          totalCount = count;
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
 * @description 获取青龙面板令牌
 * @returns {Promise<string|boolean>} 返回一个包含青龙面板令牌或布尔值的 Promise。
 */
async function qlToken() {
  // 初始化访问令牌
  let accessToken;

  // 构建请求体
  const options = {
    url: `${$.qlUrl}/open/auth/token?client_id=${$.qlId}&client_secret=${$.qlSecret}`
  };
  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 GET 请求，获取token令牌
    $.get(options, (err, resp, data) => {
      if (data) {
        const responseBody = $.toObj(data);
        if (responseBody.code === 200) {
          // 获取成功
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
  // 初始化请求体的变量名
  let requestPayload;

  // 构建请求体
  const options = {
    url: `${$.qlUrl}/open/envs?searchValue=${envsName}`,
    headers: { "Authorization": `Bearer ${$.qlToken}` }
  };

  // 返回一个 Promise 对象，用于异步操作
  return new Promise(resolve => {
    // 发送 GET 请求，搜索指定变量
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
  // 构建请求体
  const options = {
    url: `${$.qlUrl}/open/envs`,
    headers: { "Authorization": `Bearer ${$.qlToken}` },
    body: data
  };

  // 返回一个 Promise 对象，用于异步操作
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