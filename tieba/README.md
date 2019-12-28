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

4. 为什么百度贴吧签到没有系统通知

   - 百度貌似用的 GBK 编码目前无法优雅地解码，所以就算提示出来吧名也是乱码的
   - 我有 20 个吧不想被消息轰炸
   - 目前考虑提示`本次成功:3, 本次失败:4, 今天共签5`这种提示形式，但代码层面受限制，还在想办法实现

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)
