import {
    ComponentType,
    Fragment,
    memo,
    MutableRefObject,
    ReactNode,
    RefObject,
    useCallback,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import CacheComponent from '../CacheComponent';
import { v4 } from 'uuid';

const MemoCacheComponent = memo(CacheComponent, (prevProps, nextProps) => {
    return prevProps.active === nextProps.active;
});

interface Props {
    children: ReactNode;
    /**
     * active name
     */
    activeName: string;
    /**
     * max cache count default 10
     */
    max?: number;
    /**
     * cache: boolean default true
     */
    cache?: boolean;
    /**
     * maxRemoveStrategy: 'PRE' | 'LRU' default 'PRE'
     *
     * PRE: remove the first cacheNode
     *
     * LRU: remove the least recently used cacheNode
     */
    strategy?: 'PRE' | 'LRU';
    /**
     * aliveRef: KeepAliveRef
     *
     * aliveRef is a ref to get caches, remove cache by name, clean all cache, clean other cache except current
     *
     */
    aliveRef?: RefObject<KeepAliveRef | undefined> | MutableRefObject<KeepAliveRef | undefined>;

    exclude?: Array<string | RegExp> | string | RegExp;

    include?: Array<string | RegExp> | string | RegExp;

    /**
     * suspenseElement: Suspense Wrapper Component
     */
    suspenseElement?: ComponentType<{
        children: ReactNode;
    }>;

    /**
     *  errorElement: for every cacheNode's ErrorBoundary
     */
    errorElement?: ComponentType<{
        children: ReactNode;
    }>;
}

function isNil(value: any): value is null | undefined {
    return value === null || value === undefined;
}

function isRegExp(value: any): value is RegExp {
    return Object.prototype.toString.call(value) === '[object RegExp]';
}

function isArr(value: any): value is Array<any> {
    return Array.isArray(value);
}

interface CacheNode {
    name: string;
    ele?: ReactNode;
    cache: boolean;
    lastActiveTime: number;
    uid: string;
}

/**
 * RemoveStrategies is a strategy to remove cacheNodes
 *
 * PRE: remove the first cacheNode
 *
 * LRU: remove the least recently used cacheNode
 */
const RemoveStrategies: Record<string, (nodes: CacheNode[]) => CacheNode[]> = {
    PRE: (nodes: CacheNode[]) => {
        nodes.shift();
        return nodes;
    },
    LRU: (nodes: CacheNode[]) => {
        const node = nodes.reduce((prev, cur) => {
            return prev.lastActiveTime < cur.lastActiveTime ? prev : cur;
        });
        nodes.splice(nodes.indexOf(node), 1);
        return nodes;
    },
};

type KeepAliveRef = {
    getCaches: () => Array<CacheNode>;

    removeCache: (name: string) => void;

    cleanAllCache: () => void;

    cleanOtherCache: () => void;

    /**
     * refresh cacheNode by name, if name is not provided, refresh current displayed cacheNode
     * @param name
     */
    refresh: (name?: string) => void;
};

export function useKeepaliveRef() {
    return useRef<KeepAliveRef>();
}

function KeepAlive(props: Props) {
    const {
        aliveRef,
        cache = true,
        strategy = 'PRE',
        activeName,
        children,
        max = 10,
        errorElement,
        suspenseElement: SuspenseElement = Fragment,
    } = props;
    const containerDivRef = useRef<HTMLDivElement>(null);
    const [cacheNodes, setCacheNodes] = useState<Array<CacheNode>>([]);

    useLayoutEffect(() => {
        if (isNil(activeName)) return;
        setCacheNodes(prevCacheNodes => {
            // remove cacheNodes with cache false node
            prevCacheNodes = prevCacheNodes.filter(item => item.cache);

            // remove cacheNodes with exclude
            if (!isNil(props.exclude)) {
                const exclude = isArr(props.exclude) ? props.exclude : [props.exclude];
                prevCacheNodes = prevCacheNodes.filter(item => {
                    return !exclude.some(exclude => {
                        if (isRegExp(exclude)) {
                            return exclude.test(item.name);
                        } else {
                            return item.name === exclude;
                        }
                    });
                });
            }

            // only keep cacheNodes with include
            if (!isNil(props.include)) {
                const include = isArr(props.include) ? props.include : [props.include];
                prevCacheNodes = prevCacheNodes.filter(item => {
                    return include.some(include => {
                        if (isRegExp(include)) {
                            return include.test(item.name);
                        } else {
                            return item.name === include;
                        }
                    });
                });
            }

            const lastActiveTime = Date.now();

            const cacheNode = prevCacheNodes.find(item => item.name === activeName);

            if (cacheNode) {
                return prevCacheNodes.map(item => {
                    if (item.name === activeName) {
                        return {
                            ...item,
                            cache,
                            lastActiveTime,
                            ele: children,
                        };
                    }
                    return item;
                });
            } else {
                if (prevCacheNodes.length >= max) {
                    const removeStrategyFunc = RemoveStrategies[strategy];
                    if (removeStrategyFunc) {
                        prevCacheNodes = removeStrategyFunc(prevCacheNodes);
                    } else {
                        throw new Error(`strategy ${strategy} is not supported`);
                    }
                }
                return [
                    ...prevCacheNodes,
                    {
                        name: activeName,
                        uid: v4(),
                        cache,
                        lastActiveTime,
                        ele: children,
                    },
                ];
            }
        });
    }, [children, activeName, setCacheNodes, max, cache, strategy, props.exclude, props.include]);

    const refresh = useCallback(
        (name?: string) => {
            name = name || activeName;
            setCacheNodes(cacheNodes => {
                return cacheNodes.map(item => {
                    if (item.name === name) {
                        return {
                            ...item,
                            ele: children,
                            uid: v4(),
                        };
                    }
                    return item;
                });
            });
        },
        [setCacheNodes, activeName],
    );

    const destroy = useCallback(
        (name: string) => {
            setCacheNodes(cacheNodes => {
                return cacheNodes.filter(item => item.name !== name);
            });
        },
        [setCacheNodes],
    );

    useImperativeHandle(
        aliveRef,
        () => ({
            getCaches: () => cacheNodes,
            removeCache: (name: string) => {
                setCacheNodes(cacheNodes => {
                    return [...cacheNodes.filter(item => item.name !== name)];
                });
            },
            cleanAllCache: () => {
                setCacheNodes([]);
            },
            cleanOtherCache: () => {
                setCacheNodes(cacheNodes => {
                    return [...cacheNodes.filter(item => item.name === activeName)];
                });
            },
            refresh: refresh,
        }),
        [cacheNodes, setCacheNodes, activeName, children, refresh],
    );

    return (
        <Fragment>
            <div ref={containerDivRef} className={'keep-alive-render'}></div>
            <SuspenseElement>
                {cacheNodes.map(item => {
                    const { name, ele, uid } = item;
                    return (
                        <MemoCacheComponent
                            containerDivRef={containerDivRef}
                            key={uid}
                            errorElement={errorElement}
                            active={activeName === name}
                            name={name}
                            destroy={destroy}
                        >
                            {ele}
                        </MemoCacheComponent>
                    );
                })}
            </SuspenseElement>
        </Fragment>
    );
}

export default KeepAlive;
