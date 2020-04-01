var cookieName = '七猫小说'
var qmnovel = init()
var DCURL = qmnovel.getdata("UrlDC")
var DCKEY = qmnovel.getdata("CookieDC")
var NCURL = qmnovel.getdata("UrlNC")
var NCKEY = qmnovel.getdata("CookieNC")
var VDURL = qmnovel.getdata("UrlVD")
var VDKEY = qmnovel.getdata("CookieVD")
var LTURL = qmnovel.getdata("UrlLT")
var LTKEY = qmnovel.getdata("CookieLT")
var VCURL = qmnovel.getdata("UrlVC")
var Totalresult = new Array()
var time = 100

let isGetCookie = typeof $request !== 'undefined'

if (isGetCookie) {
   GetCookie()
   qmnovel.done()
} else {
   all()
   qmnovel.done()
}

async function all() {
  await DailyCheckin(time);
  await VideoCoin(time);
  await VideoCheckin(time);
  await NoviceCheckin(time);
  await LuckyTurn(time,1);
  await LuckyTurn(time,2);
  await LuckyTurn(time,3);
  await LuckyTurn(time,4);
  await LuckyTurn(time,5);
  await Notify();
}


function GetCookie() {
  const dailycheckin = '/api/v1/sign-in/do-sign-in';
  const novice = '/api/v1/task/get-novice-reward';
  const videocheckin = '/api/v1/task/get-watch-video-reward';
  const turn = '/api/v2/lucky-draw/do-extracting';
  const video = '/api/v1/sign-in/sign-in-video-coin';
  var url = $request.url;
  if (url.indexOf(dailycheckin) != -1) {
     if (url) {
        var UrlKeyDC = "UrlDC";
        var UrlNameDC = "七猫小说日常签到";
        var UrlValueDC = url;
        if (qmnovel.getdata(UrlKeyDC) != (undefined || null)) {
           if (qmnovel.getdata(UrlKeyDC) != UrlValueDC) {
              var urlDC = qmnovel.setdata(UrlValueDC, UrlKeyDC);
              if (!urlDC) {
                 qmnovel.msg("更新" + UrlNameDC + "Url失败‼️", "", "");
                 } else {
                 qmnovel.msg("更新" + UrlNameDC + "Url成功🎉", "", "");
                 }
              } else {
              qmnovel.msg(UrlNameDC + "Url未变化❗️", "", "");
              }
           } else {
           var urlDC = qmnovel.setdata(UrlValueDC, UrlKeyDC);
           if (!cookieDC) {
              qmnovel.msg("首次写入" + UrlNameDC + "Url失败‼️", "", "");
              } else {
              qmnovel.msg("首次写入" + UrlNameDC + "Url成功🎉", "", "");
              }
           }
        } else {
        qmnovel.msg("写入" + UrlNameDC + "Url失败‼️", "", "配置错误, 无法读取URL, ");
        }
     if ($request.headers) {
        var CookieKeyDC = "CookieDC";
        var CookieNameDC = "七猫小说日常签到及视频奖励";
        var CookieValueDC = JSON.stringify($request.headers);
        if (qmnovel.getdata(CookieKeyDC) != (undefined || null)) {
           if (qmnovel.getdata(CookieKeyDC) != CookieValueDC) {
              var cookieDC = qmnovel.setdata(CookieValueDC, CookieKeyDC);
              if (!cookieDC) {
                 qmnovel.msg("更新" + CookieNameDC + "Cookie失败‼️", "", "");
                 } else {
                 qmnovel.msg("更新" + CookieNameDC + "Cookie成功🎉", "", "");
                 }
              } else {
              qmnovel.msg(CookieNameDC + "Cookie未变化❗️", "", "");
              }
           } else {
           var cookieDC = qmnovel.setdata(CookieValueDC, CookieKeyDC);
           if (!cookieDC) {
              qmnovel.msg("首次写入" + CookieNameDC + "Cookie失败‼️", "", "");
              } else {
              qmnovel.msg("首次写入" + CookieNameDC + "Cookie成功🎉", "", "");
              }
           }
        } else {
        qmnovel.msg("写入" + CookieNameDC + "Cookie失败‼️", "", "配置错误, 无法读取请求头, ");
        }
     } else if (url.indexOf(videocheckin) != -1) {
     if (url) {
        var UrlKeyVD = "UrlVD";
        var UrlNameVD = "七猫小说视频签到";
        var UrlValueVD = url;
        if (qmnovel.getdata(UrlKeyVD) != (undefined || null)) {
           if (qmnovel.getdata(UrlKeyVD) != UrlValueVD) {
              var UrlVD = qmnovel.setdata(UrlValueVD, UrlKeyVD);
              if (!UrlVD) {
                 qmnovel.msg("更新" + UrlNameVD + "Url失败‼️", "", "");
                 } else {
                 qmnovel.msg("更新" + UrlNameVD + "Url成功🎉", "", "");
                 }
              } else {
              qmnovel.msg(UrlNameVD + "Url未变化❗️", "", "");
              }
           } else {
           var UrlVD = qmnovel.setdata(UrlValueVD, UrlKeyVD);
           if (!UrlVD) {
              qmnovel.msg("首次写入" + UrlNameVD + "Url失败‼️", "", "");
              } else {
              qmnovel.msg("首次写入" + UrlNameVD + "Url成功🎉", "", "");
              }
           }
        } else {
        qmnovel.msg("写入" + UrlNameVD + "Url失败‼️", "", "配置错误, 无法读取URL, ");
        }    
     if ($request.headers) {
        var CookieKeyVD = "CookieVD";
        var CookieNameVD = "七猫小说视频签到";
        var CookieValueVD = JSON.stringify($request.headers);
        if (qmnovel.getdata(CookieKeyVD) != (undefined || null)) {
           if (qmnovel.getdata(CookieKeyVD) != CookieValueVD) {
              var cookieVD = qmnovel.setdata(CookieValueVD, CookieKeyVD);
              if (!cookieVD) {
                 qmnovel.msg("更新" + CookieNameVD + "Cookie失败‼️", "", "");
                 } else {
                 qmnovel.msg("更新" + CookieNameVD + "Cookie成功🎉", "", "");
                 }
              } else {
              qmnovel.msg(CookieNameVD + "Cookie未变化❗️", "", "");
              }
           } else {
           var cookieVD = qmnovel.setdata(CookieValueVD, CookieKeyVD);
           if (!cookieVD) {
              qmnovel.msg("首次写入" + CookieNameVD + "Cookie失败‼️", "", "");
              } else {
              qmnovel.msg("首次写入" + CookieNameVD + "Cookie成功🎉", "", "");
              }
           }
        } else {
        qmnovel.msg("写入" + CookieNameVD + "Cookie失败‼️", "", "配置错误, 无法读取请求头, ");
        }
     } else if (url.indexOf(novice) != -1) {
     if (url) {
        var UrlKeyNC = "UrlNC";
        var UrlNameNC = "七猫小说新人签到";
        var UrlValueNC = url;
        if (qmnovel.getdata(UrlKeyNC) != (undefined || null)) {
           if (qmnovel.getdata(UrlKeyNC) != UrlValueNC) {
              var urlNC = qmnovel.setdata(UrlValueNC, UrlKeyNC);
              if (!urlNC) {
                 qmnovel.msg("更新" + UrlNameNC + "Url失败‼️", "", "");
                 } else {
                 qmnovel.msg("更新" + UrlNameNC + "Url成功🎉", "", "");
                 }
              } else {
              qmnovel.msg(UrlNameNC + "Url未变化❗️", "", "");
              }
           } else {
           var urlNC = qmnovel.setdata(UrlValueNC, UrlKeyNC);
           if (!urlNC) {
              qmnovel.msg("首次写入" + UrlNameNC + "Url失败‼️", "", "");
              } else {
              qmnovel.msg("首次写入" + UrlNameNC + "Url成功🎉", "", "");
              }
           }
        } else {
        qmnovel.msg("写入" + UrlNameNC + "Url失败‼️", "", "配置错误, 无法读取URL, ");
        }    
     if ($request.headers) {
        var CookieKeyNC = "CookieNC";
        var CookieNameNC = "七猫小说新人签到";
        var CookieValueNC = JSON.stringify($request.headers);
        if (qmnovel.getdata(CookieKeyNC) != (undefined || null)) {
           if (qmnovel.getdata(CookieKeyNC) != CookieValueNC) {
              var cookieNC = qmnovel.setdata(CookieValueNC, CookieKeyNC);
              if (!cookieNC) {
                 qmnovel.msg("更新" + CookieNameNC + "Cookie失败‼️", "", "");
                 } else {
                 qmnovel.msg("更新" + CookieNameNC + "Cookie成功🎉", "", "");
                 }
              } else {
              qmnovel.msg(CookieNameNC + "Cookie未变化❗️", "", "");
              }
           } else {
           var cookieNC = qmnovel.setdata(CookieValueNC, CookieKeyNC);
           if (!cookieNC) {
              qmnovel.msg("首次写入" + CookieNameNC + "Cookie失败‼️", "", "");
              } else {
              qmnovel.msg("首次写入" + CookieNameNC + "Cookie成功🎉", "", "");
              }
           }
        } else {
        qmnovel.msg("写入" + CookieNameNC + "Cookie失败‼️", "", "配置错误, 无法读取请求头, ");
        }
     } else if (url.indexOf(turn) != -1) {
     if (url) {
        var UrlKeyLT = "UrlLT";
        var UrlNameLT = "七猫小说幸运大转盘";
        var UrlValueLT = url;
        if (qmnovel.getdata(UrlKeyLT) != (undefined || null)) {
           if (qmnovel.getdata(UrlKeyLT) != UrlValueLT) {
              var urlLT = qmnovel.setdata(UrlValueLT, UrlKeyLT);
              if (!urlLT) {
                 qmnovel.msg("更新" + UrlNameLT + "Url失败‼️", "", "");
                 } else {
                 qmnovel.msg("更新" + UrlNameLT + "Url成功🎉", "", "");
                 }
              } else {
              qmnovel.msg(UrlNameLT + "Url未变化❗️", "", "");
              }
           } else {
           var urlLT = qmnovel.setdata(UrlValueLT, UrlKeyLT);
           if (!urlLT) {
              qmnovel.msg("首次写入" + UrlNameLT + "Url失败‼️", "", "");
              } else {
              qmnovel.msg("首次写入" + UrlNameLT + "Url成功🎉", "", "");
              }
           }
        } else {
        qmnovel.msg("写入" + UrlNameLT + "Url失败‼️", "", "配置错误, 无法读取URL, ");
        }
     if ($request.headers) {
        var CookieKeyLT = "CookieLT";
        var CookieNameLT = "七猫小说幸运大转盘";
        var CookieValueLT = JSON.stringify($request.headers);
        if (qmnovel.getdata(CookieKeyLT) != (undefined || null)) {
           if (qmnovel.getdata(CookieKeyLT) != CookieValueLT) {
              var cookieLT = qmnovel.setdata(CookieValueLT, CookieKeyLT);
              if (!cookieLT) {
                 qmnovel.msg("更新" + CookieNameLT + "Cookie失败‼️", "", "");
                 } else {
                 qmnovel.msg("更新" + CookieNameLT + "Cookie成功🎉", "", "");
                 }
              } else {
              qmnovel.msg(CookieNameLT + "Cookie未变化❗️", "", "");
              }
           } else {
           var cookieLT = qmnovel.setdata(CookieValueLT, CookieKeyLT);
           if (!cookieLT) {
              qmnovel.msg("首次写入" + CookieNameLT + "Cookie失败‼️", "", "");
              } else {
              qmnovel.msg("首次写入" + CookieNameLT + "Cookie成功🎉", "", "");
              }
           }
        } else {
        qmnovel.msg("写入" + CookieNameLT + "Cookie失败‼️", "", "配置错误, 无法读取请求头, ");
        }
     } else if (url.indexOf(video) != -1) {
     if (url) {
        var UrlKeyVC = "UrlVC";
        var UrlNameVC = "七猫小说视频奖励";
        var UrlValueVC = url;
        if (qmnovel.getdata(UrlKeyVC) != (undefined || null)) {
           if (qmnovel.getdata(UrlKeyVC) != UrlValueVC) {
              var urlVC = qmnovel.setdata(UrlValueVC, UrlKeyVC);
              if (!urlVC) {
                 qmnovel.msg("更新" + UrlNameVC + "Url失败‼️", "", "");
                 } else {
                 qmnovel.msg("更新" + UrlNameVC + "Url成功🎉", "", "");
                 }
              } else {
              qmnovel.msg(UrlNameVC + "Url未变化❗️", "", "");
              }
           } else {
           var urlVC = qmnovel.setdata(UrlValueVC, UrlKeyVC);
           if (!urlVC) {
              qmnovel.msg("首次写入" + UrlNameVC + "Url失败‼️", "", "");
              } else {
              qmnovel.msg("首次写入" + UrlNameVC + "Url成功🎉", "", "");
              }
           }
        } else {
        qmnovel.msg("写入" + UrlNameVC + "Url失败‼️", "", "配置错误, 无法读取URL, ");
        }
     }     
}

function DailyCheckin(t) {
  return new Promise(resolve => { setTimeout(() => {
      url = { url: DCURL, headers: JSON.parse(DCKEY) }
      qmnovel.get(url, (error, response, data) => { 
        try {
            var obj = JSON.parse(data);
            qmnovel.log(`${cookieName}日常签到, data: ${data}`)
            if (obj.data) {
               var DCresult = '日常签到结果: 成功🎉 签到奖励: '+ obj.data.coin +'金币\n';
               Totalresult.push(DCresult);
            } else if (obj.errors) {
               if (obj.errors.code == 23010103) {
                  var DCresult = '日常签到结果: 成功(重复签到)🎉\n';
                  Totalresult.push(DCresult);
               } else {
                  var DCresult = '日常签到结果: 失败‼️ 说明: ' + obj.errors.details + '\n';
                  Totalresult.push(DCresult);                
               }
            }          
            resolve('done');        
         } catch (e) {
            resolve('done')
         }
      })}, t)
   })
}

function NoviceCheckin(t) {
   return new Promise(resolve => { setTimeout(() => {
       url = { url: NCURL, headers: JSON.parse(NCKEY) }
       qmnovel.get(url, (error, response, data) => {
         try {
             var obj = JSON.parse(data);
             qmnovel.log(`${cookieName}新人签到, data: ${data}`)
             if (obj.data) {
                var NCresult = '新人签到结果: 成功🎉 签到奖励: '+ obj.data.reward_cash +'金币\n';
                Totalresult.push(NCresult);
             } else if (obj.errors) {
                if (obj.errors.code == 13101002) {
                   var NCresult = '新人签到结果: 成功(重复签到)🎉 说明: ' + obj.errors.details + '\n';
                   Totalresult.push(NCresult);
                } else {
                   var NCresult = '新人签到结果: 失败‼️ 说明: ' + obj.errors.details + '\n';
                   Totalresult.push(NCresult);
                }
             }
             resolve('done');    
         } catch (e) {
             resolve('done')
         }
     })}, t)
   })
 }

function VideoCheckin(t) {
  return new Promise(resolve => { setTimeout(() => {
      var ctime = new Date().getTime()
      VDURL = VDURL.replace(/t=\d*/g,"t=" + ctime)
      url = { url: VDURL, headers: JSON.parse(VDKEY) }
      qmnovel.get(url, (error, response, data) => {
        try {
            var obj = JSON.parse(data);
            qmnovel.log(`${cookieName}视频签到, data: ${data}`)
            if (obj.data) {
               var VDresult = '视频签到结果: 成功🎉 签到奖励: '+ obj.data.reward_cash +'金币\n';
               Totalresult.push(VDresult);
            } else if (obj.errors) {
               if (obj.errors.code == 13201003) {
                  var VDresult = '视频签到结果: 成功(重复签到)🎉 说明: ' + obj.errors.details + '\n';
                  Totalresult.push(VDresult);
               } else {
                  var VDresult = '视频签到结果: 失败‼️ 说明: ' + obj.errors.details + '\n';
                  Totalresult.push(VDresult);
               }
            }
            resolve('done');        
         } catch (e) {
            resolve('done')
         }
      })}, t)
   })
}

function VideoCoin(t) {
  return new Promise(resolve => { setTimeout(() => {
      url = { url: VCURL, headers: JSON.parse(DCKEY) }
      qmnovel.get(url, (error, response, data) => {  
        try {
            var obj = JSON.parse(data);
            qmnovel.log(`${cookieName}视频奖励, data: ${data}`)
            if (obj.data) {
               var VCresult = '视频奖励: 成功🎉 签到奖励: '+ $obj.data.coin +'金币\n';
               Totalresult.push(VCresult);
            } else if (obj.errors) {
               if (obj.errors.code == 23010107) {
                  var VCresult = '视频奖励: 成功(重复签到)🎉 说明: ' + obj.errors.details + '\n';
                  Totalresult.push(VCresult);
               } else {
                  var VCresult = '视频奖励: 失败‼️ 说明: ' + obj.errors.details + '\n';
                  Totalresult.push(VCresult);
             }
            }
            resolve('done'); 
         } catch (e) {
            resolve('done')
         }
      })}, t)
   })
}

function LuckyTurn(t,n) {
  return new Promise(resolve => { setTimeout(() => {
      url = { url: LTURL, headers: JSON.parse(LTKEY) }
      qmnovel.get(url, (error, response, data) => {
        try { 
            var obj = JSON.parse(data);
            qmnovel.log(`${cookieName}幸运大转盘, data: ${data}`)
            if (obj.data) {
               var LTresult = '第' + n + '次' + '幸运大转盘: 成功🎉 转盘奖励: ' + obj.data.prize_title + '\n';
               Totalresult.push(LTresult);
            } else if (obj.errors) {
               if (obj.errors.code == 13101002) {
                  var LTresult = '幸运大转盘: 次数耗尽🚫 说明: ' + obj.errors.details + '\n';
                  Totalresult.push(LTresult);
               } else {
                  var LTresult = '幸运大转盘: 失败‼️ 说明: ' + obj.errors.details + '\n';
                  Totalresult.push(LTresult);
               }
            }
            resolve('done');  
         } catch (e) {
            resolve('done')
         }
      })}, t)
   })
}

function Notify() {
  return new Promise(resolve => {
      try {
          let details = Totalresult.join("")
          qmnovel.msg(cookieName, '', details)
          resolve('done');
      } catch (e) {
          resolve('done')
      }
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
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  put = (url, cb) => {
    if (isSurge()) {
      $httpClient.put(url, cb)
    }
    if (isQuanX()) {
      url.method = 'PUT'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, put, done }
}