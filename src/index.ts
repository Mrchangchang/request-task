/*
 * @Author: Mr Chang
 * @Date: 2021-01-13 15:02:45
 * @LastEditTime: 2021-01-21 00:22:27
 * @LastEditors: Mr Chang
 * @Description: 
 * @FilePath: \request-pool\src\index.ts
 */

interface Option {
  limit: number,
  maxErrorCount: number
}
interface Task {
  fn: () => Promise<any>,
  errorCount: number,
  uuid: number,
  doResolve: Function,
  doReject: Function
}
class RequestPool {
  // 并发限制
  public limit: number = 4
  private taskQueue: Array<Task>  = []
  // 初始id
  private initialId: number = 0
  // 发送请求次数
  private count: number = 0
  // 是否正在发送请求
  private isSending: boolean = false
  // 最大重试次数
  private maxErrorCount: number = 0
  private static _instance: RequestPool
  constructor () {
    
  }
  public static getInstance () : RequestPool {
    this._instance || (this._instance = new RequestPool())
    return this._instance
  }
  setOption (option: Option = {limit: 1, maxErrorCount: 3}) {
    const { limit, maxErrorCount } = option
    this.limit = limit > 0 ? limit : 1
    this.maxErrorCount = maxErrorCount
  }
  /**
   * @description: 添加到任务队列
   * @param {function} fn
   * @return { Promise<any> }
   */
  addTask (fn: () => Promise<any>) : Promise<any> {
    return new Promise((resolve, reject) => {
      const task:Task = {
        fn,
        errorCount: 0,
        uuid: ++this.initialId,
        doResolve: resolve,
        doReject: reject
      }
      this.taskQueue.push(task)
      this.sendRequest()
    })
  }
  
  private sendRequest () {
    if (this.isSending) return
    this.isSending = true
    // let isStop = false
    let limit = this.limit
    const start = async () => {
      // if (isStop) return
      const task = this.taskQueue.shift()
      if (!task) {
        // 任务队列为空
        this.isSending = false
        return
      }
      const {fn, doResolve, doReject } = task
      try {
        console.time('请求耗费时间')
        const res = await fn()
        // 统计成功发送请求次数
        this.count++
        doResolve(res)
        console.timeEnd('请求耗费时间')
        console.log( '请求次数:%d;当前时间:%s',this.count, Date.now());
        // 递归调用
        start()
      } catch(err) {
        // 如果超过最大重试次数
        if (++task.errorCount > this.maxErrorCount) {
          // addTask 返回promise对象为rejected状态
          doReject(err)
        } else {
          // 重试此任务，放到队头
          this.taskQueue.unshift(task)
        }
        // 继续递归调用
        start()
      }
    }
    //执行请求任务队列
    while (limit-- > 0) {
      start()
    }
  }
}

export default RequestPool.getInstance()