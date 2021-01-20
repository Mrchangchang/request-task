"use strict";
/*
 * @Author: Mr Chang
 * @Date: 2021-01-13 15:02:45
 * @LastEditTime: 2021-01-21 00:22:27
 * @LastEditors: Mr Chang
 * @Description:
 * @FilePath: \request-pool\src\index.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var RequestPool = /** @class */ (function () {
    function RequestPool() {
        // 并发限制
        this.limit = 4;
        this.taskQueue = [];
        // 初始id
        this.initialId = 0;
        // 发送请求次数
        this.count = 0;
        // 是否正在发送请求
        this.isSending = false;
        // 最大重试次数
        this.maxErrorCount = 0;
    }
    RequestPool.getInstance = function () {
        this._instance || (this._instance = new RequestPool());
        return this._instance;
    };
    RequestPool.prototype.setOption = function (option) {
        if (option === void 0) { option = { limit: 1, maxErrorCount: 3 }; }
        var limit = option.limit, maxErrorCount = option.maxErrorCount;
        this.limit = limit > 0 ? limit : 1;
        this.maxErrorCount = maxErrorCount;
    };
    /**
     * @description: 添加到任务队列
     * @param {function} fn
     * @return { Promise<any> }
     */
    RequestPool.prototype.addTask = function (fn) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var task = {
                fn: fn,
                errorCount: 0,
                uuid: ++_this.initialId,
                doResolve: resolve,
                doReject: reject
            };
            _this.taskQueue.push(task);
            _this.sendRequest();
        });
    };
    RequestPool.prototype.sendRequest = function () {
        var _this = this;
        if (this.isSending)
            return;
        this.isSending = true;
        // let isStop = false
        var limit = this.limit;
        var start = function () { return __awaiter(_this, void 0, void 0, function () {
            var task, fn, doResolve, doReject, res, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        task = this.taskQueue.shift();
                        if (!task) {
                            // 任务队列为空
                            this.isSending = false;
                            return [2 /*return*/];
                        }
                        fn = task.fn, doResolve = task.doResolve, doReject = task.doReject;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        console.time('请求耗费时间');
                        return [4 /*yield*/, fn()
                            // 统计成功发送请求次数
                        ];
                    case 2:
                        res = _a.sent();
                        // 统计成功发送请求次数
                        this.count++;
                        doResolve(res);
                        console.timeEnd('请求耗费时间');
                        console.log('请求次数:%d;当前时间:%s', this.count, Date.now());
                        // 递归调用
                        start();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        // 如果超过最大重试次数
                        if (++task.errorCount > this.maxErrorCount) {
                            // addTask 返回promise对象为rejected状态
                            doReject(err_1);
                        }
                        else {
                            // 重试此任务，放到队头
                            this.taskQueue.unshift(task);
                        }
                        // 继续递归调用
                        start();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        //执行请求任务队列
        while (limit-- > 0) {
            start();
        }
    };
    return RequestPool;
}());
exports.default = RequestPool.getInstance();
//# sourceMappingURL=index.js.map