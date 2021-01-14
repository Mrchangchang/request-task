<!--
 * @Author: Mr Chang
 * @Date: 2021-01-13 17:05:50
 * @LastEditTime: 2021-01-14 15:38:03
 * @LastEditors: Mr Chang
 * @Description: 
 * @FilePath: \request-pool\READEME.md
-->
# 异步任务并发控制

### 简单使用
将浏览器的ajax请求或其他异步操作封装成一个返回Primise对象纯函数，添加到任务队列，控制异步任务的并发数；
```javascript
import requestPoll from 'request-poll'
import axios from 'axios'

// 使用
requestPoll.addTask(() => axios.get('xxx')).then(res => {
  console.log(res)
})

```
### 自定义选项
```javascript
// 可以自定义并发数和每个异步操作的最大错误次数
requestPoll.setOption{{
  limit: 4, // 不设置默认为4,最小为1
  maxErrorCount: 3 // 不设置默认为3
}}
```