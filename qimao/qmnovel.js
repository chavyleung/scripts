var cookieName = '七猫小说'
var qmnovel = init()
var DCURL = qmnovel.getdata("UrlDC")
var DCKEY = qmnovel.getdata("CookieDC")
var NCURL = qmnovel.getdata("UrlNC")
var NCKEY = qmnovel.getdata("CookieNC")
var LTURL = qmnovel.getdata("UrlLT")
var LTKEY = qmnovel.getdata("CookieLT")
var VCURL = qmnovel.getdata("UrlVC")
var Totalresult = new Array()
var time = 0

let isGetCookie = typeof $request !== 'undefined'

if (isGetCookie) {
   GetCookie()
   qmnovel.done()
} else {
   all()
   qmnovel.done()
}

function all() {
 LuckyTurn(time,1).then(LuckyTurn(time,2)).then(LuckyTurn(time,3)).then(LuckyTurn(time,4)).then(LuckyTurn(time,5)).then(DailyCheckin(time)).then(VideoCoin(time)).then(NoviceCheckin(time)).then((data) => {Notify(1000)});
}


function GetCookie() {
  const dailycheckin = '/api/v1/sign-in/do-sign-in';
  const novice = '/api/v1/task/get-novice-reward';
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
        qmnovel.msg("写入" + UrlNameDC + "Url失败‼️", "", "配置错误, 无法读取请求头, ");
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
        qmnovel.msg("写入" + UrlNameNC + "Url失败‼️", "", "配置错误, 无法读取请求头, ");
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
        qmnovel.msg("写入" + UrlNameLT + "Url失败‼️", "", "配置错误, 无法读取请求头, ");
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
        qmnovel.msg("写入" + UrlNameVC + "Url失败‼️", "", "配置错误, 无法读取请求头, ");
        }
     }     
}

function DailyCheckin(t) {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
          url = { url: DCURL, headers: JSON.parse(DCKEY) }
          qmnovel.get(url, (error, response, data) => {
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
        })
      }
      catch (erre) {
        resolve('done')
      }
    }, t)
  })
}

function NoviceCheckin(t) {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
          url = { url: NCURL, headers: JSON.parse(NCKEY) }
          qmnovel.get(url, (error, response, data) => {
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
        })
      }
      catch (erre) {
        resolve('done')
      }
    }, t)
  })
}

function VideoCoin(t) {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
          url = { url: VCURL, headers: JSON.parse(DCKEY) }
          qmnovel.get(url, (error, response, data) => {
          var obj = JSON.parse(data);
          qmnovel.log(`${cookieName}视频奖励, data: ${data}`)
          if (obj.data) {
             var VCresult = '视频签到结果: 成功🎉 签到奖励: '+ $obj.data.coin +'金币\n';
             Totalresult.push(VCresult);
          } else if (obj.errors) {
             if (obj.errors.code == 23010107) {
                var VCresult = '视频签到结果: 成功(重复签到)🎉 说明: ' + obj.errors.details + '\n';
                Totalresult.push(VCresult);
             } else {
                var VCresult = '视频签到结果: 失败‼️ 说明: ' + obj.errors.details + '\n';
                Totalresult.push(VCresult);
             }
          }
          resolve('done');
        })
      }
      catch (erre) {
        resolve('done')
      }
    }, t)
  })
}

function LuckyTurn(t,n) {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
          url = { url: LTURL, headers: JSON.parse(LTKEY) }
          qmnovel.get(url, (error, response, data) => {
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
        })
      }
      catch (erre) {
        resolve('done')
      }
    }, t)
  })
}

function Notify(t) {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
          let details = Totalresult.join("")
          qmnovel.msg(cookieName, '', details)
      }
      catch (erre) {
        resolve()
      }
    }, t)
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