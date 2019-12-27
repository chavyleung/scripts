# V2EX

## 配置

```properties
[MITM]
*.v2ex.com

[Script]
http-request ^https:\/\/www\.v2ex\.com\/mission\/daily script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/v2ex/v2ex.cookie.js
cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/v2ex/v2ex.js
```

## 说明

1. 先把`*.v2ex.com`加到`[MITM]`
2. 再把两条远程脚本放到`[Script]`
3. 浏览器访问并登录: https://www.v2ex.com
4. 打开浏览器访问: https://www.v2ex.com/mission/daily
5. `Surge`提示: `Cookie [V2EX] 写入成功`
6. 最后就可以把第 1 条脚本注释掉了

> 第 1 条脚本是用来获取 cookie 的, 用浏览器访问一次获取 cookie 成功后就可以删掉或注释掉了, 但请确保在`登录成功`后再获取 cookie.

> 第 2 条脚本是签到脚本, 每天`00:00:10`执行一次.

## 常见问题

1. 无法写入 Cookie

   - 检查 Surge 系统通知权限放开了没
   - 如果你用的是 Safari, 请尝试在浏览地址栏`手动输入网址`(不要用复制粘贴)

2. 写入 Cookie 成功, 但签到不成功

   - 看看是不是在登录前就写入 Cookie 了
   - 如果是，请确保在登录成功后，再尝试写入 Cookie

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)
