/**
 *
 * [MITM]
 * music.163.com
 *
 * [rewrite_local]
 * ^https:\/\/music\.163\.com\/m\/ url script-response-body neteasemusic.cookie.js
 *
 * [task_local]
 * 1 0 0 * * neteasemusic.js
 *
 */

function sign() {
  const cookieName = '网易云音乐'
  const cookieKey = 'chavy_cookie_neteasemusic'
  const cookieVal = $prefs.valueForKey(cookieKey)

  const pc = `http://music.163.com/api/point/dailyTask?type=1`
  const mobile = `http://music.163.com/api/point/dailyTask?type=0`

  let url = {
    url: null,
    headers: {
      Cookie: cookieVal
    }
  }
  url.url = pc
  $task.fetch(url).then((response) => {
    log('网易云音乐(PC端)', response.body)
  })

  url.url = mobile
  $task.fetch(url).then((response) => {
    log('网易云音乐(移动端)', response.body)
  })
}

function log(title, data) {
  let result = JSON.parse(data)
  if (result.code == 200) {
    console.log(`签到成功: ${title}`)
    $notify('签到成功', title, '')
  } else if (result.code == -2) {
    console.log(`签到跳过: ${title}, 编码: ${result.code}, 原因: ${result.msg}`)
    $notify('签到跳过', title, `原因: ${result.msg}`)
  } else {
    console.log(`签到失败: ${title}, 编码: ${result.code}, 原因: ${result.msg}`)
    $notify('签到失败', title, `原因: ${result.msg}`)
  }
}

sign()
