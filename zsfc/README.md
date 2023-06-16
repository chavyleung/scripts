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
掌上飞车Cookie = type=http-request, pattern=^https://mwegame\.qq\.com/ams/sign/doSign/month, requires-body=1, max-size=-1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=10
掌上飞车 =type=cron, cronexp="0 10 0 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=10
```

## 配置 (Loon)

```properties
[Mitm]
hostname = mwegame.qq.com

[Script]
http-request ^https://mwegame\.qq\.com/ams/sign/doSign/month script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/zsfc.js, requires-body=true, timeout=10, tag=掌上飞车Cookie
cron "0 10 0 * * *" script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/zsfc.js, tag=掌上飞车
```

## 配置 (QuanX)

```properties
[MITM]
hostname = mwegame.qq.com

[rewrite_local]
^https://mwegame\.qq\.com/ams/sign/doSign/month url scripts-request-body https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/zsfc.js

[task_local]
0 10 0 * * * https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/zsfc.js, tag=掌上飞车, enabled=true
```

## 说明

1. 先把`mwegame.qq.com`加到`[MITM]`
2. 再配置重写规则:
   - Surge: 把两条远程脚本放到`[Script]`
   - Loon: 把两条远程脚本放到`[Script]`
   - QuanX: 把远程重写脚本放到`[rewrite_local]`，再把远程定时任务放到`[task_local]`
3. 打开 APP[掌上飞车](https://apps.apple.com/cn/app/%E6%8E%8C%E4%B8%8A%E9%A3%9E%E8%BD%A6/id1116903233) 然后手动签到 1 次, 系统提示: `✅ 获取签到数据成功！`
4. 运行一次脚本, 如果提示重复签到, 那就算成功了!

## 常见问题

1. 无法写入 Cookie

   - 检查系统通知权限放开了没

2. 写入 Cookie 成功, 但签到不成功

   - 看看是不是在登录前就写入 Cookie 了
   - 如果是，请确保在登录成功后，再尝试写入 Cookie

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)

[@danchaw](https://github.com/danchaw)

[@chiupam](https://github.com/chiupam)
