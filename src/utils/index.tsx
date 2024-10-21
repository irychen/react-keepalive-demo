export function isNil(value: any): value is null | undefined {
    return value === null || value === undefined;
}

export function isRegExp(value: any): value is RegExp {
    return Object.prototype.toString.call(value) === '[object RegExp]';
}

export function isArr(value: any): value is Array<any> {
    return Array.isArray(value);
}

export function isFn(value: any): value is Function {
    return typeof value === 'function';
}

export function delayAsync(seconds: number = 100): Promise<void> {
    let _timeID: null | number | NodeJS.Timeout;
    return new Promise<void>((resolve, _reject) => {
        _timeID = setTimeout(() => {
            resolve();
            if (!isNil(_timeID)) {
                clearTimeout(_timeID);
            }
        }, seconds);
    });
}

let _lock = false;

export function getLock() {
    return _lock;
}

export function setLock(value: boolean) {
    _lock = value;
}
