# APK.TW

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可

> iOS 需要网关级翻墙!

> iOS 需要网关级翻墙!

> iOS 需要网关级翻墙!

> surge mac 环节下无需网关级翻墙, 可直接运行 (可能需要打开增强模式)!

> 目前尚不清楚 Cookie 有效期如何

> 如果你看到这里还没放弃, 请仔细下面的操作说明 (需要点骚操作)

解释:

由于 apk.tw 需要翻墙, 又由于 iOS 的限制, Surge & QuanX 在脚本内的请求都无法走代理, 所以 iOS 环境下, 请保证本脚本在路由或网关级翻墙环境下运行!

## 配置 (Surge)

```properties
[MITM]
apk.tw

[Script]
http-request ^https:\/\/apk\.tw\/?.? script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/apktw/apktw.cookie.js
cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/apktw/apktw.js
```

## 配置 (QuanX)

```properties
[MITM]
apk.tw

[rewrite_local]
# 189及以前版本
^https:\/\/apk\.tw\/?.? url script-response-body apktw.cookie.js
# 190及以后版本
^https:\/\/apk\.tw\/?.? url script-request-header apktw.cookie.js

[task_local]
1 0 * * * apktw.js
```

## 说明

> 先在登录成功后, 再打开获取 Cookie 的脚本

1. 先在浏览器登录 `(先登录! 先登录! 先登录!)`, https://apk.tw/
2. 滑到页面底部, 点击`电脑版`, 把页面切换为电脑版, 确认登录成功后再执行下面步骤
3. 先把`apk.tw`加到`[MITM]`
4. 再配置重写规则:
   - Surge: 把两条远程脚本放到`[Script]`
   - QuanX: 把`apktw.cookie.js`和`apktw.js`传到`On My iPhone - Quantumult X - Scripts` (传到 iCloud 相同目录也可, 注意要打开 quanx 的 iCloud 开关)
5. 打开浏览器访问: https://apk.tw
6. 系统提示: `获取Cookie: 成功`
7. 最后就可以把第 1 条脚本注释掉了

> 第 1 条脚本是用来获取 cookie 的, 用浏览器访问一次获取 cookie 成功后就可以删掉或注释掉了, 但请确保在`登录成功`后再获取 cookie.

> 第 2 条脚本是签到脚本, 每天`00:00:10`执行一次.

## 常见问题

1. 无法写入 Cookie

   - 检查 Surge 系统通知权限放开了没
   - 如果你用的是 Safari, 请尝试在浏览地址栏`手动输入网址`(不要用复制粘贴)

2. 写入 Cookie 成功, 但签到不成功

   - 看看是不是在登录前就写入 Cookie 了
   - 如果是，请确保在登录成功后，再尝试写入 Cookie

3. 为什么有时成功有时失败

   - 很正常，网络问题，哪怕你是手工签到也可能失败（凌晨签到容易拥堵就容易失败）
   - 暂时不考虑代码级的重试机制，但咱有配置级的（暴力美学）：

   - `Surge`配置:

     ```properties
     # 没有什么是一顿饭解决不了的:
     cron "10 0 0 * * *" script-path=xxx.js # 每天00:00:10执行一次
     # 如果有，那就两顿:
     cron "20 0 0 * * *" script-path=xxx.js # 每天00:00:20执行一次
     # 实在不行，三顿也能接受:
     cron "30 0 0 * * *" script-path=xxx.js # 每天00:00:30执行一次

     # 再粗暴点，直接:
     cron "* */60 * * * *" script-path=xxx.js # 每60分执行一次
     ```

   - `QuanX`配置:

     ```properties
     [task_local]
     1 0 * * * xxx.js # 每天00:01执行一次
     2 0 * * * xxx.js # 每天00:02执行一次
     3 0 * * * xxx.js # 每天00:03执行一次

     */60 * * * * xxx.js # 每60分执行一次
     ```

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)

```
<img src="./source/plugin/dsu_amupper/images/dk.gif" style="margin-bottom:-6px;">
https://apk.tw/plugin.php?id=dsu_amupper:pper&ajax=1&formhash=9894bd20&zjtesttimes=1577779673&inajax=1&ajaxtarget=my_amupper
:method: GET
:scheme: https
:authority: apk.tw
:path: /plugin.php?id=dsu_amupper:pper&ajax=1&formhash=9894bd20&zjtesttimes=1577779673&inajax=1&ajaxtarget=my_amupper
Accept: */*
Cookie: xfhP_2132_dsu_amupper_header=PHNwYW4gY2xhc3M9InBpcGUiPnw8L3NwYW4%2BPGEgaWQ9Im15X2FtdXBwZXIiIGhyZWY9ImphdmFzY3JpcHQ6OyIgb25jbGljaz0iYWpheGdldCgncGx1Z2luLnBocD9pZD1kc3VfYW11cHBlcjpwcGVyJmFqYXg9MSZmb3JtaGFzaD05ODk0YmQyMCZ6anRlc3R0aW1lcz0xNTc3Nzc5Njc0JywgJ215X2FtdXBwZXInLCAnbXlfYW11cHBlcicsICfnsL3liLDkuK0nLCAnJyxmdW5jdGlvbiAoKSB7dG9uZXBsYXllcigwKTt9KTsiPjxpbWcgc3JjPSIuL3NvdXJjZS9wbHVnaW4vZHN1X2FtdXBwZXIvaW1hZ2VzL2RrLmdpZiIgc3R5bGU9Im1hcmdpbi1ib3R0b206LTZweDsiPjwvYT4%3D; xfhP_2132_lastact=1577779674%09home.php%09spacecp; __asc=b3c0cc6c16f5afd676092d4eda8; __auc=dce799f516f59f067237a2febb9; _ga=GA1.2.1608429304.1577761929; _gid=GA1.2.1688629439.1577761939; xfhP_2132_noticeTitle=1; xfhP_2132_nofavfid=1; xfhP_2132_sid=J87Vc1; xfhP_2132_auth=7ac24btCR%2BdI6b4lefpECmxYWj0Wn9yVqWWBGEcJbcrJJQ%2Fict%2F6dtRYiEbwRqBBA9KS0YQBQ5gi4yXDAIRIiGR8WIxb; xfhP_2132_ulastactivity=915f6BAyOWJu5e6W%2FFDdReWOBJY9iCFtYx%2BtJZFz36l7rpWBZnyF; xfhP_2132_secqaa=26426276.be83416687a9ef3d73; xfhP_2132_sendmail=1; xfhP_2132_lastvisit=1577758319; xfhP_2132_saltkey=sy5ICtnI; __cfduid=d070a2409b8f31d15ce3354ce3514c78e1577761919
Accept-Language: zh-cn
Host: apk.tw
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15
Referer: https://apk.tw/forum.php
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
X-Requested-With: XMLHttpRequest
```
