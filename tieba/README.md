# 百度贴吧

## 配置

```properties
[MITM]
tieba.baidu.com

[Script]
http-request ^http:\/\/tieba\.baidu\.com script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.cookie.js
cron "10 0 0 * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.js
```

## 说明

1. 先把`tieba.baidu.com`加到`[MITM]`
2. 再把两条远程脚本放到`[Script]`
3. 先用浏览器登录: https://tieba.baidu.com
4. 再用浏览器访问一下: http://tieba.baidu.com （注意了, 是 http, 没有 s）
5. `Surge`提示: `Cookie [百度贴吧] 写入成功`
6. 最后就可以把第 1 条脚本注释掉了

> 第 1 条脚本是用来获取 cookie 的, 用浏览器访问一次获取 cookie 成功后就可以删掉或注释掉了, 但请确保在`登录成功`后再获取 cookie.

> 第 2 条脚本是签到脚本, 每天`00:00:10`执行一次.

## 常见问题

1. 无法写入 Cookie

   - 检查 Surge 系统通知权限放开了没
   - 如果你用的是 Safari, 请尝试在浏览地址栏`手动输入网址`(不要用复制粘贴)
   - 注意: 写入 Cookie 的网址是`http`开头的(不是 https, 没有 s, 没有 s, 没有要)

2. 写入 Cookie 成功, 但签到不成功

   - 看看是不是在登录前就写入 Cookie 了
   - 如果是，请确保在登录成功后，再尝试写入 Cookie

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)
