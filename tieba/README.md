# 百度贴吧

## 配置

```properties
[MITM]
tieba.baidu.com

[Script]
http-request ^http://tieba.baidu.com script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.cookie.js
cron "10 0 0 * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.js
```

## 说明

1. 先把`tieba.baidu.com`加到`[MITM]`
2. 再把两条远程脚本放到`[Script]`
3. 用浏览器访问下: http://tieba.baidu.com (需要登录)
4. `Surge`提示: `Cookie [百度贴吧] 写入成功`
5. 最后就可以把第 1 条脚本注释掉了

> 第 1 条脚本是用来获取 cookie 的, 用浏览器访问一次获取 cookie 成功后就可以删掉或注释掉了

> 第 2 条脚本是签到脚本, 每天`00:00:10`执行一次.

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)
