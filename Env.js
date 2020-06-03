function Env(name) {
  this.name = name
  this.logs = []
  this.isSurge = () => 'undefined' !== typeof $httpClient
  this.isQuanX = () => 'undefined' !== typeof $task
  this.log = (...log) => {
    this.logs = [...this.logs, ...log]
    if (log) console.log(log.join('\n'))
    else console.log(this.logs.join('\n'))
  }
  this.msg = (title = this.name, subt = '', desc = '') => {
    if (this.isSurge()) $notification.post(title, subt, desc)
    if (this.isQuanX()) $notify(title, subt, desc)
    this.log('==============📣系统通知📣==============')
    if (title) this.log(title)
    if (subt) this.log(subt)
    if (desc) this.log(desc)
  }
  this.getdata = (key) => {
    if (this.isSurge()) return $persistentStore.read(key)
    if (this.isQuanX()) return $prefs.valueForKey(key)
  }
  this.setdata = (val, key) => {
    if (this.isSurge()) return $persistentStore.write(val, key)
    if (this.isQuanX()) return $prefs.setValueForKey(val, key)
  }
  this.get = (url, callback) => this.send(url, 'GET', callback)
  this.wait = (min, max = min) => (resove) => setTimeout(() => resove(), Math.floor(Math.random() * (max - min + 1) + min))
  this.post = (url, callback) => this.send(url, 'POST', callback)
  this.send = (url, method, callback) => {
    if (this.isSurge()) {
      const __send = method == 'POST' ? $httpClient.post : $httpClient.get
      __send(url, (error, response, data) => {
        if (response) {
          response.body = data
          response.statusCode = response.status
        }
        callback(error, response, data)
      })
    }
    if (this.isQuanX()) {
      url.method = method
      $task.fetch(url).then(
        (response) => {
          response.status = response.statusCode
          callback(null, response, response.body)
        },
        (reason) => callback(reason.error, reason, reason)
      )
    }
  }
  this.done = (value = {}) => $done(value)
}
