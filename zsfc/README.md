# 掌上飞车

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可
> 感谢[@danchaw](https://github.com/danchaw) PR
> 感谢[@chiupam](https://github.com/chiupam) 修改
> 
## 配置 (Surge)

```properties
[MITM]
hostname = %APPEDN% mwegame.qq.com

[Script]
# 掌上飞车
掌上飞车Cookie = type=http-request, pattern=^https?://mwegame\.qq\.com/ams/sign/doSign/month, requires-body=1, max-size=-1, script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/zsfc.js, script-update-interval=0, timeout=15
掌上飞车 =type=cron, cronexp="0 10 0 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/zsfc.js, script-update-interval=0, timeout=30
```

## 配置 (QuanX)

```properties
[MITM]
hostname = mwegame.qq.com

[rewrite_local]
^https:\/\/mwegame\.qq\.com\/ams\/sign\/doSign\/month url script-request-header https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js

[task_local]
10 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
```

## 说明

1. 先把`mwegame.qq.com`加到`[MITM]`
2. 再配置重写规则:
   - Surge: 把两条远程脚本放到`[Script]`
   - QuanX: 把`zsfc.js`传到`On My iPhone - Quantumult X - Scripts` (传到 iCloud 相同目录也可, 注意要打开 quanx 的 iCloud 开关)
3. 打开 APP[掌上飞车](https://apps.apple.com/cn/app/%E6%8E%8C%E4%B8%8A%E9%A3%9E%E8%BD%A6/id1116903233) 然后手动签到 1 次, 系统提示: `✅ 获取签到数据成功！`
4. 运行一次脚本, 如果提示重复签到, 那就算成功了!

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

[@danchaw](https://github.com/danchaw)

[@chiupam](https://github.com/chiupam)
