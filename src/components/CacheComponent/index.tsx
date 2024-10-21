import { ComponentType, Fragment, memo, ReactNode, RefObject, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import MemoCacheComponentProvider from '../KeepAliveProvider';
import { delayAsync, getLock, setLock } from '../../utils';
interface Props {
    containerDivRef: RefObject<HTMLDivElement>;
    active: boolean;
    name: string;
    errorElement?: ComponentType<{
        children: ReactNode;
    }>;
    children: ReactNode;
    destroy: (name: string) => void;
    refresh: (name?: string) => void;
    cacheDivClassName?: string;
    renderCount: number;
    async: boolean;
    microAsync: boolean;
    transition: boolean;
    duration: number;
    isCached: (name: string) => boolean;
}

function CacheComponent(props: Props) {
    const {
        containerDivRef,
        active,
        children,
        destroy,
        name,
        refresh,
        errorElement: ErrorBoundary = Fragment,
        cacheDivClassName = `cache-component`,
        renderCount,
        async,
        microAsync,
        transition,
        duration,
        isCached,
    } = props;
    const activatedRef = useRef(false);

    const cache = isCached(name);

    activatedRef.current = activatedRef.current || active;

    const cacheDiv = useMemo(() => {
        const cacheDiv = document.createElement('div');
        cacheDiv.setAttribute('data-name', name);
        cacheDiv.setAttribute('data-cached', cache.valueOf().toString());
        cacheDiv.setAttribute('style', 'height: 100%');
        cacheDiv.setAttribute('data-render-count', renderCount.toString());
        cacheDiv.className = cacheDivClassName;
        return cacheDiv;
    }, [renderCount]);

    const containerDiv = containerDivRef.current;

    (async () => {
        if (containerDiv && active && getLock() === false) {
            setLock(true);
            console.warn(`transition remove ${name}`, active, containerDiv);
            Array.from(containerDiv.children).forEach(node => {
                node.setAttribute('data-active', 'false');
                node.classList.remove('active');
                node.classList.add('inactive');
            });
            await delayAsync(duration);
            Array.from(containerDiv.children).forEach(node => {
                node.remove();
            });
            console.warn(`transition add ${name}`, active, containerDiv);
            containerDiv.appendChild(cacheDiv);
            cacheDiv.classList.remove('inactive');
            cacheDiv.classList.add('active');
            cacheDiv.setAttribute('data-active', 'true');
            setTimeout(() => {
                setLock(false);
            }, 300);
        }
    })();

    // if (transition) {
    //     (async () => {

    //     })();
    // }

    const cacheDestroy = useCallback(() => {
        destroy(name);
    }, [destroy, name]);

    return activatedRef.current
        ? createPortal(
              <ErrorBoundary>
                  <MemoCacheComponentProvider active={active} destroy={cacheDestroy} refresh={refresh}>
                      {children}
                  </MemoCacheComponentProvider>
              </ErrorBoundary>,
              cacheDiv,
              name,
          )
        : null;
}

export default memo(CacheComponent);
