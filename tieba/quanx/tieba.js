const cookieName = "百度贴吧";
const cookieKey = "chavy_cookie_tieba";
const cookieVal = $prefs.valueForKey(cookieKey);

function sign() {
  let url = {
    url: `http://tieba.baidu.com/f/like/mylike`,
    headers: {
      Cookie: cookieVal
    }
  };
  $task.fetch(url).then(response => {
    let data = response.body;
    let regex = /\/f\?kw=([^{'"}]*)/g;
    let cnt = 0;
    for (const bar of data.matchAll(regex)) {
      cnt += 1;
      setTimeout(() => signBar(bar), cnt * 500);
    }
  });
}

function signBar(bar) {
  let url = {
    url: `http://tieba.baidu.com/sign/add?ie=utf-8&kw=${bar[1]}`,
    method: "POST",
    headers: { Cookie: cookieVal }
  };
  $task.fetch(url).then(response => {
    let data = response.body;
    let result = JSON.parse(data);
    if (result.no == 0) {
      console.log(`正在签到: ${bar[1]}, 签到成功`);
    } else {
      console.log(
        `正在签到: ${bar[1]}, 错误编码: ${result.no}, 错误原因: ${result.error}`
      );
    }
  });
}

sign();
