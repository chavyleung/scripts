# 顺丰速运 (APP)

## 配置 (Surge)

```properties
[MITM]
hostname = ccsp-egmas.sf-express.com

[Script]
Rewrite: 顺丰速运 = type=http-request, pattern=^https:\/\/ccsp-egmas.sf-express.com\/cx-app-member\/member\/app\/user\/universalSign,script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/sfexpress/sfexpress.cookie.js,requires-body=true
cron "1 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/sfexpress/sfexpress.js
```

## 配置 (QuanX)

```properties
[MITM]
hostname = ccsp-egmas.sf-express.com

[rewrite_local]
^https:\/\/ccsp-egmas.sf-express.com\/cx-app-member\/member\/app\/user\/universalSign url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/sfexpress/sfexpress.cookie.js

[task_local]
1 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/sfexpress/sfexpress.js
```

## 配置 (Loon)

```properties
[MITM]
hostname = ccsp-egmas.sf-express.com

[Script]
http-request ^https:\/\/ccsp-egmas.sf-express.com\/cx-app-member\/member\/app\/user\/universalSign script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/sfexpress/sfexpress.cookie.js, requires-body=true, tag=Rewrite: 顺丰速运
cron "1 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/sfexpress/sfexpress.js
```

## 说明

1. 配置重写
2. `APP` 我的顺丰 > 任务中心 > 去签到
3. 提示 `获取会话: 成功`
4. 注释重写

## 感谢

[@wangfei021325](https://github.com/wangfei021325)
