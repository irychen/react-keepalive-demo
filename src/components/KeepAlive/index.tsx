import {
    ComponentType,
    Fragment,
    MutableRefObject,
    ReactNode,
    RefObject,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import CacheComponent from '../CacheComponent';
import { isArr, isNil, isRegExp } from '../../utils';
import { safeStartTransition } from '../../compat/startTransition';

type Strategy = 'PRE' | 'LRU';

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
     * maxRemoveStrategy: 'PRE' | 'LRU' default 'LRU'
     *
     * PRE: remove the first cacheNode
     *
     * LRU: remove the least recently used cacheNode
     */
    strategy?: Strategy;
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

    animationWrapper?: ComponentType<{
        children: ReactNode;
    }>;

    /**
     * onBeforeActive: callback before active
     * @param name
     *
     * you can do something before active
     *
     */
    onBeforeActive?: (name: string) => void;
    /**
     *  containerDivRef: root node to mount cacheNodes
     */
    containerDivRef?: MutableRefObject<HTMLDivElement>;
    /**
     *  cacheDivClassName: className set for cacheNodes
     */
    cacheDivClassName?: string;

    /**
     * async: whether to use async to render current cacheNode default false
     */
    async?: boolean;
    /**
     * microAsync: whether to use microAsync to render current cacheNode default true
     */
    microAsync?: boolean;

    transition?: boolean;
    duration?: number;
}

interface CacheNode {
    name: string;
    ele?: ReactNode;
    lastActiveTime: number;
    renderCount: number;
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

export type KeepAliveRef = {
    getCaches: () => Array<CacheNode>;

    /**
     * remove cacheNode by name
     * @param name cacheNode name to remove
     * @returns
     */
    removeCache: (name: string) => Promise<void>;

    /**
     * clean all cacheNodes
     */
    cleanAllCache: () => void;

    /**
     * clean other cacheNodes except current active cacheNode
     */
    cleanOtherCache: () => void;

    /**
     * refresh cacheNode by name
     * @param name cacheNode name to refresh if name is not provided, refresh current active cacheNode
     */
    refresh: (name?: string) => void;
};

export function useKeepaliveRef() {
    return useRef<KeepAliveRef>();
}

function KeepAlive(props: Props) {
    const {
        aliveRef,
        strategy = 'LRU',
        activeName,
        children,
        max = 10,
        errorElement,
        suspenseElement: SuspenseElement = Fragment,
        animationWrapper: AnimationWrapper = Fragment,
        onBeforeActive,
        containerDivRef: containerDivRefFromProps,
        cacheDivClassName,
        async = false,
        microAsync = true,
        transition = false,
        duration = 300,
    } = props;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const containerDivRef = containerDivRefFromProps || useRef<HTMLDivElement>(null);
    const [cacheNodes, setCacheNodes] = useState<Array<CacheNode>>([]);

    const isCached = useCallback(
        (name: string) => {
            const includes = isArr(props.include) ? props.include : props.include ? [props.include] : [];
            const excludes = isArr(props.exclude) ? props.exclude : props.exclude ? [props.exclude] : [];
            if (
                includes.some(include => {
                    if (isRegExp(include)) {
                        return include.test(name);
                    } else {
                        return name === include;
                    }
                })
            )
                return true;

            if (
                excludes.some(exclude => {
                    if (isRegExp(exclude)) {
                        return exclude.test(name);
                    } else {
                        return name === exclude;
                    }
                })
            )
                return false;

            return true;
        },
        [props.exclude, props.include],
    );

    useLayoutEffect(() => {
        if (isNil(activeName)) return;
        safeStartTransition(() => {
            setCacheNodes(prevCacheNodes => {
                const lastActiveTime = Date.now();
                const cacheNode = prevCacheNodes.find(item => item.name === activeName);

                if (cacheNode) {
                    return prevCacheNodes.map(item => {
                        if (item.name === activeName) {
                            onBeforeActive && onBeforeActive(activeName);
                            return { name: activeName, lastActiveTime, ele: children, renderCount: item.renderCount };
                        }
                        return item;
                    });
                } else {
                    onBeforeActive && onBeforeActive(activeName);
                    if (prevCacheNodes.length >= max) {
                        const removeStrategyFunc = RemoveStrategies[strategy];
                        if (removeStrategyFunc) {
                            prevCacheNodes = removeStrategyFunc(prevCacheNodes);
                        } else {
                            throw new Error(`strategy ${strategy} is not supported`);
                        }
                    }
                    return [...prevCacheNodes, { name: activeName, lastActiveTime, ele: children, renderCount: 0 }];
                }
            });
        });
    }, [children, activeName, setCacheNodes, max, strategy, props.exclude, props.include]);

    const destroy = useCallback(
        (name: string) => {
            setCacheNodes(cacheNodes => {
                return cacheNodes.filter(item => item.name !== name);
            });
        },
        [setCacheNodes],
    );

    const refresh = useCallback(
        (name?: string) => {
            setCacheNodes(cacheNodes => {
                const targetName = name || activeName;
                return cacheNodes.map(item => {
                    if (item.name === targetName) {
                        return { ...item, renderCount: item.renderCount + 1 };
                    }
                    return item;
                });
            });
        },
        [setCacheNodes, activeName],
    );

    useImperativeHandle(
        aliveRef,
        () => ({
            getCaches: () => cacheNodes,
            removeCache: async (name: string) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        setCacheNodes(cacheNodes => {
                            return [...cacheNodes.filter(item => item.name !== name)];
                        });
                        resolve();
                    }, 0);
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

            refresh,
        }),
        [cacheNodes, setCacheNodes, activeName],
    );

    useEffect(() => {
        console.log('cacheNodes', cacheNodes);
    }, [cacheNodes]);

    return (
        <Fragment>
            <AnimationWrapper>
                <div ref={containerDivRef} className={'keep-alive-render'} style={{ height: '100%' }}></div>
            </AnimationWrapper>
            <SuspenseElement>
                {cacheNodes.map(item => {
                    const { name, ele, renderCount } = item;
                    return (
                        <CacheComponent
                            isCached={isCached}
                            transition={transition}
                            duration={duration}
                            async={async}
                            microAsync={microAsync}
                            renderCount={renderCount}
                            containerDivRef={containerDivRef}
                            key={name}
                            errorElement={errorElement}
                            active={activeName === name}
                            name={name}
                            destroy={destroy}
                            refresh={refresh}
                            cacheDivClassName={cacheDivClassName}
                        >
                            {ele}
                        </CacheComponent>
                    );
                })}
            </SuspenseElement>
        </Fragment>
    );
}

export default KeepAlive;
