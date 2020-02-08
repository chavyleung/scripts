# 头脑吃鸡

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可

## 配置 (Surge)

```properties
[MITM]
tncj.hortorgames.com

[Script]
http-response ^https://tncj.hortorgames.com/chicken/fight/(answer|findQuiz) requires-body=1,max-size=0,script-path=scripts/tncj.js
```

## 配置 (QuanX)

```properties
[MITM]
tncj.hortorgames.com

[rewrite_local]
^https://tncj.hortorgames.com/chicken/fight/(answer|findQuiz) url script-response-body tncj.js

```

## 感谢

[@LeeeMooo](https://github.com/LeeeMooo)
