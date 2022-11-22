import {
  createHttp,
  type Http,
  type HttpRequestConfig,
  type Notification,
  wait
} from '@boxapp/core-runtime'

/**
 * 函数主入口
 *
 * 环境变量:
 * 1. 移动端登录请求`HAR`(二选一)
 *  1.1 sfexpress
 *  1.2 chavy_login_sfexpress
 */
export const sfexpress = async (store: SFExpress) => {
  // 1. init env
  const http = createHttp()
  const harData = store.sfexpress ?? store.chavy_login_sfexpress
  if (harData === undefined)
    throw new Error(
      '[SFExpress] HarNotFound! Please check your environment variables'
    )

  // 2. login app (for the `sign`)
  const har = JSON.parse(harData)
  const sign = await loginApp(http, har)
  await wait(1_000)

  // 3. login web (for the response cookies)
  await loginWeb(http, sign)
  await wait(1_000)

  // 4. execute: daily sign
  const signResult = await executeSign(http)
  await wait(1_000)

  // 5. execute: daily tasks
  await executeTasks(http)
  await wait(1_000)

  // 6. query latest state
  const dailyTasks = await queryTasks(http)

  // 7. notification
  const notification = createNotification(signResult, dailyTasks)

  return { notification }
}

/**
 * 登录移动端
 *
 * 1. 根据`HAR`重放移动端登录请求
 * 2. 返回`sign`
 */
export const loginApp = (http: Http, har: SFExpressHar) => {
  delete har.headers?.Cookie

  const { url, body, headers } = har
  return http.post(url, body, { headers }).then((resp) => {
    const sign = resp.data?.obj?.sign
    if (!sign) {
      console.error(resp)
      throw new Error('[SFExpress] LoginAppFailed!')
    }

    return sign
  })
}

/**
 * 登录网页端
 *
 * 1. 通过`sign`登录网页端
 * 2. 登录状态由 http 实例自动维护 (后续使用同一个 http 实例皆为登录状态)
 */
export const loginWeb = (http: Http, sign: string) => {
  const userSign = encodeURIComponent(sign)
  const url = `https://mcs-mimp-web.sf-express.com/mcs-mimp/share/app/shareRedirect?sign=${userSign}&source=SFAPP&bizCode=647@RnlvejM1R3VTSVZ6d3BNaXJxRFpOUVVtQkp0ZnFpNDBKdytobm5TQWxMeHpVUXVrVzVGMHVmTU5BVFA1bXlwcw==`
  return http.get(url).then((resp) => {
    if (resp.status !== 200) {
      console.error(resp)
      throw new Error('[SFExpress] LoginWebFailed!')
    }

    return resp.data
  })
}

/**
 * 执行: 每日签到
 */
export const executeSign = (http: Http) => {
  const url = `https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskSignPlusService~automaticSignFetchPackage`
  const data = `{"comeFrom": "vioin", "channelFrom": "SFAPP"}`
  const headers: HttpRequestConfig['headers'] = {
    'Content-Type': 'application/json'
  }
  return http
    .post<SFResponse<SignResult>>(url, data, { headers })
    .then((resp) => {
      if (resp.status !== 200) {
        console.error(resp)
        throw new Error('[SFExpress] SignInFailed!')
      }

      console.log(resp.data)
      return resp.data.obj
    })
}

/**
 * 执行: 每日任务
 */
export const executeTasks = async (http: Http) => {
  const tasks = await queryTasks(http)
  await wait(1_000)

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]

    // fetch points
    if (task.status === 1) {
      await fetchTaskPoint(http, task)
      await wait(1_000)
    }

    // sign task
    else if (task.status === 2) {
      await executeTask(http, task)
      await wait(1_000)
      await fetchTaskPoint(http, task)
      await wait(1_000)
    }
  }

  return tasks
}

/**
 * 获取每日任务列表
 */
export const queryTasks = (http: Http) => {
  const url = `https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~queryPointTaskAndSignFromES`
  const data = `{"channelType":"1"}`
  const headers: HttpRequestConfig['headers'] = {
    'Content-Type': 'application/json'
  }
  return http
    .post<SFResponse<QueryTasksResult>>(url, data, { headers })
    .then((resp) => {
      if (resp.status !== 200) {
        console.error(resp)
        throw new Error('[SFExpress] QueryTasksFailed!')
      }

      return resp.data.obj.taskTitleLevels ?? []
    })
}

/**
 * 自动完成任务
 */
export const executeTask = (http: Http, task: Task) => {
  const url = `https://mcs-mimp-web.sf-express.com/mcs-mimp/task/finishTask?id=${task.taskCode}`
  return http.get(url)
}

/**
 * 获取任务积分
 */
export const fetchTaskPoint = (http: Http, task: Task) => {
  const url = `https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~fetchIntegral`
  const data = `{"strategyId":${task.strategyId},"taskId":"${task.taskId}","taskCode":"${task.taskCode}"}`
  const headers: HttpRequestConfig['headers'] = {
    'Content-Type': 'application/json'
  }
  return http.post(url, data, { headers }).then((resp) => {
    return resp.data.success === true
  })
}

export const createNotification = (
  signResult: SignResult,
  dailyTasks: Task[]
) => {
  const details = ['']
  details.push(`说明: 连续签到 ${signResult.countDay} 天`)

  dailyTasks.forEach((task) => {
    const { title, status, taskPeriod } = task
    const result = status === 3 ? '完成' : status === 2 ? '未完成' : '未知'
    const period = taskPeriod === 'M' ? '月' : taskPeriod === 'W' ? '周' : '日'
    details.push(`${title}(${period}): ${result}`)
  })

  const notification: Notification = {
    title: `顺丰速运`,
    subTitle: `签到: ${signResult.hasFinishSign === 1 ? '重复' : '成功'}`,
    detailContent: details.join('\n')
  }

  return notification
}

export interface SFExpress {
  sfexpress?: string
  chavy_login_sfexpress?: string
}

export interface SFExpressHar {
  url: string
  body: string
  headers: HttpRequestConfig['headers']
}

interface SFResponse<Result> {
  date: string
  success: boolean
  obj: Result
}

interface SignResult {
  hasFinishSign: number
  integralTaskSignGood: any
  awareModelType: number
  countDay: number
  ifOpenSignRemind: number
}

interface QueryTasksResult {
  taskTitleLevels: Task[]
}

export interface Task {
  strategyId: number
  taskId: string
  title: string
  taskCode: string
  display: number
  displayContent: string
  showProcess: number
  buttonContent: string
  awardIntegral: number
  receiveRule: string
  actionId: string
  pageType: string
  actionType: string
  icon: string
  level: number
  taskPeriod: string
  status: number
  process: string
  point: number
  description: string
}
