# 威锋网 (APP)

## 配置 (Surge)

```properties
[MITM]
api.wfdata.club

[Script]
Rewrite: feng = type=http-request,pattern=^https?:\/\/api.wfdata.club\/v1\/auth\/signin,script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.cookie.js,requires-body=true
cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.js
```

## 配置 (QuanX)

```properties
[MITM]
api.wfdata.club

[rewrite_local]
^https?:\/\/api.wfdata.club\/v1\/auth\/signin url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.cookie.js

[task_local]
1 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.js
```

## 配置 (Loon)

```properties
[MITM]
api.wfdata.club

[rewrite_local]
http-request ^https?:\/\/api.wfdata.club\/v1\/auth\/signin script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.cookie.js, requires-body=true, tag=Rewrite: feng

[task_local]
cron "1 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.js
```

## 说明

1. 配置重写
2. 在 `威锋网` APP 下使用 账号密码 方式登录
3. 提示 `获取会话: 成功`
4. 注释重写

## 感谢

[@wangfei021325](https://github.com/wangfei021325)
