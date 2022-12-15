# TestFlight
自动加入 TF (公测)

## Surge

### 说明:

本脚本包含两个模块
1. [testflight.har.sgmodule](https://raw.githubusercontent.com/chavyleung/scripts/master/testflight/rewrite/testflight.har.sgmodule)
    1. 用于获取 TestFlight 账号信息, 获取完即可关掉
    2. 与 `TestFlight账户管理` 冲突, 使用前请先临时关闭

2. [testflight.sgmodule](https://raw.githubusercontent.com/chavyleung/scripts/master/testflight/rewrite/testflight.sgmodule)
    1. 定时任务, 每 `1秒` 运行一次尝试加入 `TF`

### 使用:
1. 安装远程 [testflight.har.sgmodule](https://raw.githubusercontent.com/chavyleung/scripts/master/testflight/rewrite/testflight.har.sgmodule) 模块
2. 打开 `TestFlight`, 脚本提示 `获取 TestFlight 账户成功`
3. 安装 [BoxJs订阅](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2Fchavyleung%2Fscripts%2Fmaster%2Fbox%2Fchavy.boxjs.json
) (如果之前已安装, 请直接更新订阅)
4. 打开 [BoxJs](http://boxjs.com/#/app/testflight), 并填写 `应用编号` (如: McBV96Wi,uEXBDwt2)
    1. 请使用`英文逗号`分隔`应用编号`
5. 关闭 [testflight.har.sgmodule](https://raw.githubusercontent.com/chavyleung/scripts/master/testflight/rewrite/testflight.har.sgmodule) 模块
6. 安装 [testflight.sgmodule](https://raw.githubusercontent.com/chavyleung/scripts/master/testflight/rewrite/testflight.sgmodule) 模块

## 感谢
[@githubdulong](https://github.com/githubdulong)

[@DecoAri](https://github.com/DecoAri)