# 威锋网 (APP)

## 配置 (Surge)

```properties
[MITM]
49.234.36.200:9091

[Script]
Rewrite: feng = type=http-request,pattern=^http:\/\/49.234.36.200:9091\/v1\/auth\/signin,script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.cookie.js,requires-body=true
cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.js
```

## 配置 (QuanX)

```properties
[MITM]
49.234.36.200:9091

[rewrite_local]
^http:\/\/49.234.36.200:9091\/v1\/auth\/signin url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.cookie.js

[task_local]
1 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.js
```

## 配置 (Loon)

```properties
[MITM]
49.234.36.200:9091

[rewrite_local]
http-request ^http:\/\/49.234.36.200:9091\/v1\/auth\/signin script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/feng/feng.cookie.js, requires-body=true, tag=Rewrite: feng

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
