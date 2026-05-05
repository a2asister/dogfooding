"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChaosType = exports.IsolationLevel = exports.CircuitState = void 0;
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "closed";
    CircuitState["OPEN"] = "open";
    CircuitState["HALF_OPEN"] = "half_open";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
var IsolationLevel;
(function (IsolationLevel) {
    IsolationLevel["NONE"] = "none";
    IsolationLevel["THREAD_POOL"] = "thread_pool";
    IsolationLevel["SEMAPHORE"] = "semaphore";
    IsolationLevel["BULKHEAD"] = "bulkhead";
})(IsolationLevel || (exports.IsolationLevel = IsolationLevel = {}));
var ChaosType;
(function (ChaosType) {
    ChaosType["LATENCY"] = "latency";
    ChaosType["EXCEPTION"] = "exception";
    ChaosType["ABORT"] = "abort";
    ChaosType["CPU_STRESS"] = "cpu_stress";
    ChaosType["MEMORY_STRESS"] = "memory_stress";
})(ChaosType || (exports.ChaosType = ChaosType = {}));
//# sourceMappingURL=index.js.map