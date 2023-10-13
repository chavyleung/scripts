# 掌上飞车

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可

> 感谢[@danchaw](https://github.com/danchaw) PR

> 感谢[@chiupam](https://github.com/chiupam) 修改

> 代码已适配最新版掌上飞车APP，旧版本APP无法继续签到

## 配置 (Surge)

```properties
[MITM]
hostname = %APPEDN% comm.ams.game.qq.com

[Script]
掌上飞车Cookie = type=http-request, pattern=^https://mwegame\.qq\.com/ams/sign/doSign/month, requires-body=1, max-size=-1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=5
掌上飞车 =type=cron, cronexp="0 10 0,21 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=5
```

## 配置 (Loon)

```properties
[Mitm]
hostname = comm.ams.game.qq.com

[Script]
http-request ^https://mwegame\.qq\.com/ams/sign/doSign/month script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, requires-body=true, timeout=10, tag=掌上飞车Cookie
cron "0 10 0,21 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车
```

## 配置 (QuanX)

```properties
[MITM]
hostname = comm.ams.game.qq.com

[rewrite_local]
^https://mwegame\.qq\.com/ams/sign/doSign/month url scripts-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js

[task_local]
0 10 0,21 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车, enabled=true
```

## 说明

1. 先把`comm.ams.game.qq.com`加到`[MITM]`

2. 再配置重写规则:
   - Surge: 把两条远程脚本放到`[Script]`
   - Loon: 把两条远程脚本放到`[Script]`
   - QuanX: 把远程重写脚本放到`[rewrite_local]`，再把远程定时任务放到`[task_local]`
3. 打开 APP[掌上飞车](https://apps.apple.com/cn/app/%E6%8E%8C%E4%B8%8A%E9%A3%9E%E8%BD%A6/id1116903233) 然后进入签到页面, 系统提示: `✅ 获取签到数据成功！`

4. 运行一次脚本, 如果提示重复签到, 那就算成功了!

## 反馈bug

如果出现签到失败，请提交issue到[chiupam仓库](https://github.com/chiupam/surge/issues/new)

## 感谢

[@NobyDa](https://github.com/NobyDa)

[@lhie1](https://github.com/lhie1)

[@ConnersHua](https://github.com/ConnersHua)

[@danchaw](https://github.com/danchaw)

[@chiupam](https://github.com/chiupam)
