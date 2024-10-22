import { ComponentType, Fragment, memo, ReactNode, RefObject, useLayoutEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

import { delayAsync, getLock, setLock } from '../../utils';
import { safeStartTransition } from '../../compat/startTransition';
interface Props {
    containerDivRef: RefObject<HTMLDivElement>;
    active: boolean;
    name: string;
    errorElement?: ComponentType<{
        children: ReactNode;
    }>;
    children: ReactNode;
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
        name,
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

    safeStartTransition(async () => {
        if (containerDiv && active) {
            // setLock(true);
            const nodes = Array.from(containerDiv.children);
            const activeNodes = nodes.filter(node => node.getAttribute('data-active') === 'true' && node.getAttribute('data-name') !== name);
            for (const node of activeNodes) {
                node.classList.remove('active');
                node.classList.add('inactive');
                node.setAttribute('data-active', 'false');
            }
            await delayAsync(duration);
            for (const node of activeNodes) {
                node.remove();
            }
            if (containerDiv.contains(cacheDiv)) {
                // setTimeout(() => {
                //     setLock(false);
                // }, duration);
                return;
            }

            console.warn(`transition add ${name}`, active, containerDiv);
            containerDiv.appendChild(cacheDiv);
            cacheDiv.classList.remove('inactive');
            cacheDiv.classList.add('active');
            cacheDiv.setAttribute('data-active', 'true');
            // setTimeout(() => {
            //     setLock(false);
            // }, duration);
        }
    });

    return activatedRef.current ? createPortal(<ErrorBoundary>{children}</ErrorBoundary>, cacheDiv, name) : null;
}

export default memo(CacheComponent, (prev, next) => {
    return prev.active === next.active && prev.renderCount === next.renderCount;
});

// export default CacheComponent
