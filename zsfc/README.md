# 掌上飞车

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可

> 感谢[@danchaw](https://github.com/danchaw) PR、[@chiupam](https://github.com/chiupam) 修改签到脚本，感谢[@chiupam](https://github.com/chiupam) PR购物脚本、寻宝脚本

> 代码已适配最新版掌上飞车APP，旧版本APP无法继续签到，请及时更新

## 配置 (Surge)
```properties
[MITM]
hostname = %APPEDN% comm.ams.game.qq.com, bang.qq.com

[Script]
掌上飞车Cookie = type=http-request, pattern=^https?://(comm\.ams\.game\.qq\.com/ams/ame/amesvr*|bang\.qq\.com/app/speed/mall/main2\?*), requires-body=true, max-size=-1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=5
掌飞寻宝Cookie = type=http-request, pattern=^https?://bang\.qq\.com/app/speed/treasure/index\?*, requires-body=true, max-size=-1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, script-update-interval=0, timeout=60
掌上飞车 =type=cron, cronexp="0 10 0,21 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, script-update-interval=0, timeout=60
掌飞寻宝 =type=cron, cronexp="0 */11 17 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, script-update-interval=0, timeout=60
```

## 配置 (Loon)
```properties
[Mitm]
hostname = comm.ams.game.qq.com, bang.qq.com

[Script]
http-request ^https?://(comm\.ams\.game\.qq\.com/ams/ame/amesvr*|bang\.qq\.com/app/speed/mall/main2\?*) script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, requires-body=true, timeout=10, tag=掌上飞车Cookie
http-request ^https?://bang\.qq\.com/app/speed/treasure/index\?* script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, requires-body=true, timeout=60, tag=掌飞寻宝Cookie

cron "0 10 0,21 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车
cron "0 */11 17 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, tag=掌飞寻宝
```

## 配置 (QuanX)
```properties
[MITM]
hostname = comm.ams.game.qq.com, bang.qq.com

[rewrite_local]
^https?://(comm\.ams\.game\.qq\.com/ams/ame/amesvr*|bang\.qq\.com/app/speed/mall/main2\?*) url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js
^https?://bang\.qq\.com/app/speed/treasure/index\?* url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js

[task_local]
0 10 0,21 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.js, tag=掌上飞车, enabled=true
0 */11 17 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.treasure.js, tag=掌飞寻宝, enabled=true
```

## 说明

1. 先把`comm.ams.game.qq.com, bang.qq.com`加到`[MITM]`
2. 再配置重写规则:
   - Surge: 把三条远程脚本放到`[Script]`
   - Loon: 把三条远程脚本放到`[Script]`
   - QuanX: 把远程重写脚本放到`[rewrite_local]`，再把远程定时任务放到`[task_local]`
3. 打开[掌上飞车APP](https://apps.apple.com/cn/app/%E6%8E%8C%E4%B8%8A%E9%A3%9E%E8%BD%A6/id1116903233)，点击咨询栏的签到（每日福利），系统提示`✅ 获取签到数据成功！`即可
4. 打开[掌上飞车APP](https://apps.apple.com/cn/app/%E6%8E%8C%E4%B8%8A%E9%A3%9E%E8%BD%A6/id1116903233)，点击下方游戏栏，然后点击掌飞商城，系统提示`✅ 获取商城数据成功！`即可
5. 打开[掌上飞车APP](https://apps.apple.com/cn/app/%E6%8E%8C%E4%B8%8A%E9%A3%9E%E8%BD%A6/id1116903233)，点击下方游戏栏，然后点击每日寻宝，系统提示`✅ 获取寻宝数据成功！`即可
6. 如果使用了[掌飞购物](https://raw.githubusercontent.com/chavyleung/scripts/master/zsfc/zsfc.shop.js)脚本的，请继续订阅[chiupam boxjs仓库](https://raw.githubusercontent.com/chiupam/surge/main/boxjs/chiupam.boxjs.json)并在应用中设置掌飞商城所需购买的游戏道具名称

## 反馈bug
如果出现bug，请提交issue到[chiupam仓库](https://github.com/chiupam/surge/issues/new)

## 感谢
[@NobyDa](https://github.com/NobyDa)
[@lhie1](https://github.com/lhie1)
[@ConnersHua](https://github.com/ConnersHua)
[@danchaw](https://github.com/danchaw)
[@chiupam](https://github.com/chiupam)
