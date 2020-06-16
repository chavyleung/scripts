function Env(name) {
  this.name = name
  this.data = null
  this.logs = []
  this.isSurge = () => 'undefined' !== typeof $httpClient
  this.isQuanX = () => 'undefined' !== typeof $task
  this.isNode = () => 'undefined' !== typeof module && !!module.exports
  this.log = (...log) => {
    this.logs = [...this.logs, ...log]
    if (log) console.log(log.join('\n'))
    else console.log(this.logs.join('\n'))
  }
  this.msg = (title = this.name, subt = '', desc = '') => {
    if (this.isSurge()) $notification.post(title, subt, desc)
    if (this.isQuanX()) $notify(title, subt, desc)
    const _logs = ['', '==============📣系统通知📣==============']
    if (title) _logs.push(title)
    if (subt) _logs.push(subt)
    if (desc) _logs.push(desc)
    console.log(_logs.join('\n'))
  }
  this.getdata = (key) => {
    if (this.isSurge()) return $persistentStore.read(key)
    if (this.isQuanX()) return $prefs.valueForKey(key)
    if (this.isNode()) {
      const datafile = 'box.dat'
      this.fs = this.fs ? this.fs : require('fs')
      if (this.fs.existsSync(datafile)) {
        this.data = JSON.parse(this.fs.readFileSync(datafile))
        return this.data[key]
      } else {
        return null
      }
    }
  }
  this.setdata = (val, key) => {
    if (this.isSurge()) return $persistentStore.write(val, key)
    if (this.isQuanX()) return $prefs.setValueForKey(val, key)
    if (this.isNode()) {
      const datafile = 'box.dat'
      this.fs = this.fs ? this.fs : require('fs')
      if (this.fs.existsSync(datafile)) {
        this.data = JSON.parse(this.fs.readFileSync(datafile))
        this.data[key] = val
        this.fs.writeFileSync(datafile, JSON.stringify(this.data))
        return true
      } else {
        return false
      }
    }
  }
  this.wait = (min, max = min) => (resove) => setTimeout(() => resove(), Math.floor(Math.random() * (max - min + 1) + min))
  this.get = (url, callback) => this.send(url, 'GET', callback)
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
    if (this.isNode()) {
      this.request = this.request ? this.request : require('request')
      url.method = method
      url.gzip = true
      this.request(url, (err, response, body) => {
        if (response) response.status = response.statusCode
        callback(null, response, body)
      })
    }
  }
  this.done = (value = {}) => (!this.isNode() ? $done(value) : null)
}
