interface Option {
    limit: number;
    maxErrorCount: number;
}
declare class RequestPool {
    limit: number;
    private taskQueue;
    private initialId;
    private count;
    private isSending;
    private maxErrorCount;
    private static _instance;
    constructor();
    static getInstance(): RequestPool;
    setOption(option?: Option): void;
    /**
     * @description: 添加到任务队列
     * @param {function} fn
     * @return { Promise<any> }
     */
    addTask(fn: () => Promise<any>): Promise<any>;
    private sendRequest;
}
declare const _default: RequestPool;
export default _default;
