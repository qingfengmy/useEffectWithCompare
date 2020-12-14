import * as React from 'react'

type UseEffectParams = Parameters<typeof React.useEffect>
type EffectCallback = UseEffectParams[0]
type DependencyList = UseEffectParams[1]
// yes, I know it's void, but I like what this communicates about
// the intent of these functions: It's just like useEffect
type UseEffectReturn = ReturnType<typeof React.useEffect>

function checkDeps(deps: DependencyList) {
    if (!deps || !deps.length) {
        throw new Error(
            'useDeepCompareEffect should not be used with no dependencies. Use React.useEffect instead.',
        )
    }
    if (deps.every(isPrimitive)) {
        throw new Error(
            'useDeepCompareEffect should not be used with dependencies that are all primitive values. Use React.useEffect instead.',
        )
    }
}

function isPrimitive(val: unknown) {
    return val == null || /^[sbn]/.test(typeof val)
}

function useCompareMemoize(value: DependencyList, comparator: (currentDependencies: DependencyList, preDependencies: DependencyList) => Boolean) {
    const valueRef = React.useRef<DependencyList>()
    const changedRef = React.useRef<Boolean>(false)

    if (!comparator(value, valueRef.current)) {
        valueRef.current = value
        changedRef.current = !changedRef.current
    }

    return [changedRef.current]
}

/**
 * 自定义比较器，比较依赖值是否变化
 *
 * @param {EffectCallback} callback effect的回调
 * @param {DependencyList} dependencies 依赖项
 * @param {(currentDependencies: DependencyList, preDependencies: DependencyList) => Boolean} comparator 自定义比较器，相等返回true，不等返回false
 * @return {*}  {UseEffectReturn} effect清除函数
 */
function useEffectWithCompare(
    callback: EffectCallback,
    dependencies: DependencyList,
    comparator: (currentDependencies: DependencyList, preDependencies: DependencyList) => Boolean,
): UseEffectReturn {
    if (process.env.NODE_ENV !== 'production') {
        checkDeps(dependencies)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return React.useEffect(callback, useCompareMemoize(dependencies, comparator))
}


export default useEffectWithCompare