/*
支持boxjs手动修改位置，可直接输入中文地区名，感谢@58xinian制作的天气动态图
更新时间 2021-03-27 14:20
*/
const $ = new Env('墨迹天气');
const notify = $.isNode() ? require('./sendNotify') : '';
const City = encodeURIComponent($.getdata('city')||"汕头")  //可在此处修改城市
const j = $.getdata('citynum')||"1";
let reduction = $.getdata('cut') || 'false'; //日志
let daylys = $.getdata('day_desc') || 'true', //每日天气
    hourlys = $.getdata('hour_desc') || 'false', //小时预报
    indexs = $.getdata('index_desc') || 'false'; //生活指数
fortys = $.getdata('forty_desc') || 'false'; //40天预告
let Alerts = "";

!(async() => {
    await SearchCity();
    await fortyReport();
    await earthQuake();
    await Weather();
    await TodayReport();
    await showmsg()
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

function Weather() {
    return new Promise((resolve, reject) => {
        let weatherurl = {
            url: `https://co.moji.com/api/weather2/weather?lang=zh&city=${cityid}`
        }
        $.get(weatherurl, (error, response, data) => {
            try {
                $.weather = JSON.parse(data);
//$.log(JSON.stringify($.weather,null,1))
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}
function earthQuake() {
    return new Promise((resolve, reject) => {
        let url = {
            url: `http://eqapp.degal.cn/earthquake-app/api/bulletin/getNewestBulletin?userLat=${userlat}&userLng=${userlon}`
        }
        $.get(url, (error, response, data) => {
            try {
                $.earthquake = JSON.parse(data);
      //$.log(JSON.stringify($.earthquake,null,1))
              if($.earthquake.code==0){
               quake = "【地震预测】\n  "+$.earthquake.data.placeName+"在"+$.earthquake.data.interval+"，发生"+$.earthquake.data.magnitude+"级地震，震源深度"+$.earthquake.data.depth+"KM，震中距"+$.earthquake.data.distance+"KM，本地震感"+$.earthquake.data.eqFeel+"，发生时间"+$.time("yyyy-MM-dd HH:mm:ss",$.earthquake.data.shockTime)
               //$.log("\n地震预测:\n"+$.earthquake.data.placeName+"在"+$.earthquake.data.interval+"，发生"+$.earthquake.data.magnitude+"级地震，震源深度"+$.earthquake.data.depth+"KM，震中距"+$.earthquake.data.distance+"KM，本地震感"+$.earthquake.data.eqFeel+"，发生时间"+$.time("yyyy-MM-dd HH:mm:ss",$.earthquake.data.shockTime))
             }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}


function fortyReport() {
    return new Promise((resolve, reject) => {
        let fortyurl = {
            url: `https://h5ctywhr.api.moji.com/fc40`,
            headers: {
                'Host': 'h5ctywhr.api.moji.com',
            },
            body: `{"cityId": ${cityid},"cityType":${cityType}}`
        }
        $.post(fortyurl, (error, response, data) => {
            try {
                $.forty = JSON.parse(data);
//$.log(JSON.stringify($.forty,null,1))
                forDay40 = $.forty.forecastDays.forecastDay40.fallTrendDesc[0] ? $.forty.forecastDays.forecastDay40.fallTrendDesc[0].desc : "",
                temp40 = $.forty.forecastDays.forecastDay40.tempTrendDesc[0] ? $.forty.forecastDays.forecastDay40.tempTrendDesc[0].desc : "",
                forecast = $.forty.forecastDays.forecastDay[1];
                Festival = forecast.festival
                weatherDay = "今日白天: "+forecast.weatherDay+" "+forecast.windDirDay+forecast.windLevelDay+"级\n",
                weatherNight = "今日夜间: "+forecast.weatherNight+" "+forecast.windDirNight+forecast.windLevelNight+"级";
                userlat = $.forty.lat;
                userlon = $.forty.lon;
                $.log("\n"+$.forty.cityName+" "+forecast.tempLow+"℃到"+forecast.tempHigh+"℃ 空气质量: "+forecast.aqiDesc+"\n"+weatherDay+weatherNight);
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

function Indexs() {
    return new Promise((resolve, reject) => {
        let indexsurl = {
            url: `https://h5ctywhr.api.moji.com/indexDetail?cityId=${cityid}`,
            headers: {},
            body: `{"cityId": ${cityid},"cityType":${cityType}}`
        }
        $.post(indexsurl, (error, response, data) => {
            try {
                $.index = JSON.parse(data);
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

function SearchCity() {
    return new Promise((resolve) => {
        let cityurl = {
            url: `https://ssch.api.moji.com/citymanage/json/h5/searchCity?keyWord=${City}`,
            headers: {},
        }
        $.post(cityurl, (error, response, data) => {
            let result = JSON.parse(data)
            if (result.city_list.length > 0 && j <= result.city_list.length) {
                console.log("城市或者地区名称及ID序号")
                for (i = 0; i < result.city_list.length; i++) {
                    cityname = (i + 1) + ": " + result.city_list[i].name
                    cityids = result.city_list[i].cityId
                    Province = result.city_list[i].pname
                    console.log(cityname + ': ' + cityids)
                }
                cityid = result.city_list[j - 1].cityId
                cityType = result.city_list[j - 1].cityType
                cityname = result.city_list[j - 1].name
                province = result.city_list[j - 1].pname
            } else {
                $.msg($.name, "地区有误或者无此地区天气情况")
                return
            }
            resolve()
        })
    })
}

function mapSkycon(skycon) {
    const map = {
        "晴": [
            "☀️ 晴朗",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/CLEAR_DAY.gif",
        ],
        "多云": [
            "⛅️ 多云",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/PARTLY_CLOUDY_DAY.gif",
        ],
        "少云": [
            "🌤 少云",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/PARTLY_CLOUDY_DAY.gif",
        ],
        "阴": [
            "☁️ 阴天",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/CLOUDY.gif",
        ],
        "雾": [
            "🌫 雾霾",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/HAZE.gif",
        ],
        "雷阵雨": [
            "⛈ 雷阵雨",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/STORM_RAIN.gif",
        ],
        "阵雨": [
            "🌦 阵雨",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/LIGHT.gif",
        ],
        "小雨": [
            "💧 小雨",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/LIGHT.gif",
        ],
        "中雨": [
            "💦 中雨",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/MODERATE_RAIN.gif",
        ],
        "大雨": [
            "🌧 大雨",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/STORM_RAIN.gif",
        ],
        "暴雨": [
            "⛈ 暴雨",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/STORM_RAIN.gif",
        ],
        "小雪": [
            "🌨 小雪",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/LIGHT_SNOW.gif",
        ],
        "中雪": [
            "❄️ 中雪",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/MODERATE_SNOW.gif",
        ],
        "大雪": [
            "☃️ 大雪",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/HEAVY_SNOW.gif",
        ],
        "暴雪": [
            "⛄️ 暴雪",
            "https://cdn.jsdelivr.net/gh/58xinian/icon@master/Weather/HEAVY_SNOW.gif",
        ],
        "雨夹雪": [
            "🌨 雨夹雪",
            "https://cdn.jsdelivr.net/gh/Sunert/Profiles@master/QuantumultX/Rules/Images/icon/RAIN_SNOW.png",
        ],
        "扬沙": [
            "💨 扬沙",
            //"https://raw.githubusercontent.com/Sunert/Profiles/master/QuantumultX/Rules/Images/icon/RAIN_SNOW.png",
        ],
        "浮尘": [
            "💨 浮尘",
            //"https://raw.githubusercontent.com/Sunert/Profiles/master/QuantumultX/Rules/Images/icon/RAIN_SNOW.png",
        ],
        "霾": [
            "🌫 霾",
            //"https://raw.githubusercontent.com/Sunert/Profiles/master/QuantumultX/Rules/Images/icon/RAIN_SNOW.png",
        ]
        //FOG: ["🌫️ 雾"],
        //DUST: ["💨 浮尘"],
        //SAND: ["💨 沙尘"],
        //WIND: ["🌪 大风"],
    };
    return map[skycon]
}

function windSpeed(speed) {
    const map = {
        0: "无风",
        1: "软风",
        2: "轻风",
        3: "微风",
        4: "和风",
        5: "劲风",
        6: "强风",
        7: "疾风",
        8: "大风",
        9: "烈风",
        10: "狂风",
        11: "暴风",
        12: "飓风"
    }
    const wind_desc = $.weather.data.wind_desc.value;
    return `${map[wind_desc[0]]}`
}

function HourlyReport() {
    const Hourlyweather = $.weather.data.hourly
    for (i = 0; i < 6; i++) {
        hours = Hourlyweather[i].temperature.hour,
        hourweather = Hourlyweather[i].temperature.condition,
        hourly_Skycon = mapSkycon(hourweather) ? mapSkycon(hourweather)[0] : "   " + hourweather,
        hourWinds = Hourlyweather[i].wind.wind_desc.winddir + Hourlyweather[i].wind.wind_desc.value + Hourlyweather[i].wind.wind_desc.unit,
        hourtemps = Hourlyweather[i].temperature.temp.value + Hourlyweather[i].temperature.temp.unit;
        if (hourlys == 'true' && i == 0) {
            $.desc += "   " + hours + ":00  " + hourly_Skycon + "  " + hourtemps + "  " + hourWinds + "\n"
        } else if (hourlys == 'true' && (hourweather != Hourlyweather[i - 1].temperature.condition || hourtemps != Hourlyweather[i - 1].temperature.temp.value + "℃")) {
            $.desc += "   " + hours + ":00  " + hourly_Skycon + "  " + hourtemps + "  " + hourWinds + "\n"
        }
        if (reduction == 'true') {
            $.log("    " + hours + ":00  " + hourweather + "  " + hourtemps + "  " + hourWinds)
        }
    }
}

function WeekReport() {
    for (Dayweather of $.weather.data.forecast_day) {
        week = Dayweather.predict_week, // 日期     
        date = Dayweather.predict_date,

        Daysweather = Dayweather.weather_desc_day, //当日天气
        Days_Skycon = mapSkycon(Daysweather) ? mapSkycon(Daysweather)[0] : "   " + Daysweather,
        Winds = Dayweather.wind_desc_day.winddir + Dayweather.wind_desc_day.value + Dayweather.wind_desc_day.unit, //当日风速
        temps = Dayweather.temp_low.value + Dayweather.temp_low.unit + "至" + Dayweather.temp_high.value + Dayweather.temp_high.unit; //当日温度
        if (reduction == 'true') {
            $.log(" " + date + " " + Daysweather + " " + temps + " " + Winds)
        }
        $.desc += "   " + week + " " + Days_Skycon + " " + temps + " " + Winds + "\n"
    }
}

function IndexReport() {
    for (indexdata of $.index.indexs) {
        indexType = indexdata.indexType
        indexLevel = indexdata.indexLevel
        indexLevelDesc = indexdata.indexLevelDesc
        indexDesc = indexdata.indexDesc
        if (indexs == 'true') {
            $.desc += "   " + indexType + ":  " + indexLevel + "级   " + indexLevelDesc + "\n"
        }
        if (reduction == 'true') {
            console.log("\n " + indexType + "  " + indexLevel + "级  " + indexLevelDesc + "\n" + indexDesc)
        }
    }
}

function TodayReport() {
    nowweather = $.weather.data.weather_desc //当前天气
    today_Skycon = mapSkycon(nowweather) ? mapSkycon(nowweather)[0] : "   " + nowweather
    nowtemp = $.weather.data.temp.value + $.weather.data.temp.unit //当前温度
    windDirection = $.weather.data.wind_desc.winddir
    nowwindval = $.weather.data.wind_desc.value //当前风速
    nowhum = $.weather.data.humidity //当前湿度
    aqidesc = $.weather.data.aqi_desc //空气质量
    sunrise = $.weather.data.sunset.sunrise
    sundown = $.weather.data.sunset.sundown
    daytemp = $.weather.data.forecast_day[0].temp_low.value + "℃" + "-" + $.weather.data.forecast_day[0].temp_high.value + "℃"
    if ($.weather.data.alerts.length > 0) {
        Alerts = '\n【气象预警】' + "预警级别: " + $.weather.data.alerts[0].level + '\n   ' + $.weather.data.alerts[0].content
    }
    $.desc = "   当天温度: " + daytemp + "   实时温度🌡:" + nowtemp + "\n  " + ` 实时天气: ${today_Skycon}` + "   风速🌪: " + windDirection + nowwindval + "级" + windSpeed(nowwindval) + "\n   空气质量🌬: " + aqidesc + "    湿度☔️: " + nowhum + Alerts + '\n'
}

async function showmsg() {
    if (daylys == 'true') {
        $.desc += "【每周天气】\n"
        await WeekReport()
    }
    if (hourlys == 'true') {
        $.desc += "【未来6小时变化】\n"
        await HourlyReport()
    }
    if (indexs == 'true') {
        $.desc += "【生活指数】\n"
        await Indexs();
        await IndexReport()
    }
    if (fortys == 'true') {
        $.desc += "【40天预告】\n  " + forDay40 + "，"+ temp40
    }
    Skycon = mapSkycon(nowweather)?mapSkycon(nowweather)[1]:"";
    $.sub = "【今日天气】" + today_Skycon;
    $.msg($.weather.data.city + "天气预报 " + $.weather.data.forecast_day[0].predict_date + $.weather.data.forecast_day[0].predict_week + " " + Festival, $.sub, $.desc+(quake?quake:""), { "media-url": `${Skycon}`})
    if($.isNode()){
     await notify.sendNotify($.weather.data.city + "天气预报 " + $.weather.data.forecast_day[0].predict_date + $.weather.data.forecast_day[0].predict_week + " " + Festival, $.sub+"\n"+$.desc+(quake?quake:""))
    }
}
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:i,...r}=t;this.got[s](i,r).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
