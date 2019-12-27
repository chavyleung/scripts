# 网易云音乐

## 配置

```properties
[MITM]
music.163.com

[rewrite_local]
^https:\/\/music\.163\.com\/m\/ url script-response-body neteasemusic.cookie.js

[task_local]
1 0 * * * neteasemusic.js
```

## 说明

1. 先把`music.163.com`加到`[MITM]`
2. 把`neteasemusic.cookie.js`和`neteasemusic.js`传到`On My iPhone - Quantumult X - Scripts` (传到 iCloud 相同目录也可, 注意要打开 quanx 的 iCloud 开关)
3. 再把两条脚本分别放到`[rewrite_local]`和`[task_local]`
4. 浏览器访问并登录: https://music.163.com/m/login
5. 打开浏览器访问: http://music.163.com （注意了, 是 http, 没有 s）
6. `Surge`提示: `Cookie [网易云音乐] 写入成功`
7. 最后就可以把`[rewrite_local]`的脚本注释掉了

> 第 1 条脚本是用来获取 cookie 的, 用浏览器访问一次获取 cookie 成功后就可以删掉或注释掉了, 但请确保在`登录成功`后再获取 cookie.

> 第 2 条脚本是签到脚本, 每天`00:01:00`执行一次.

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
