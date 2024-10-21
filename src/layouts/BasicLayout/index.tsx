import { Link, useLocation, useOutlet } from 'react-router-dom';
import { Suspense, useMemo } from 'react';
import KeepAlive, { useKeepaliveRef } from '../../components/KeepAlive';

function BasicLayoutWithCache() {
    const outlet = useOutlet();
    const location = useLocation();
    const aliveRef = useKeepaliveRef();

    function refresh() {
        aliveRef.current?.refresh();
    }

    /**
     * to distinguish different pages to cache
     */
    const cacheKey = useMemo(() => {
        return location.pathname + location.search;
    }, [location]);

    return (
        <div>
            <h4>BasicLayout With Cache Router Example</h4>
            <Link
                to={'/counter'}
                style={{
                    marginRight: 5,
                }}
            >
                <button className={'button'}>Counter</button>
            </Link>
            <Link
                to={'/counter2'}
                style={{
                    marginRight: 5,
                }}
            >
                <button className={'button'}>Counter2</button>
            </Link>
            {/*exclude-counter*/}
            <Link
                to={'/exclude-counter'}
                style={{
                    marginRight: 5,
                }}
            >
                <button className={'button'}>Exclude Counter</button>
            </Link>

            <Link
                to={'/tabs'}
                style={{
                    marginRight: 5,
                }}
            >
                <button className={'button'}>Tabs</button>
            </Link>

            <button className={'button'} onClick={refresh}>
                Refresh
            </button>
            <div>
                <Suspense fallback={<div>Loading...</div>}>
                    <KeepAlive
                        duration={280}
                        transition
                        aliveRef={aliveRef}
                        activeName={cacheKey}
                        exclude={[/\/exclude-counter/]}
                        max={2}
                        strategy={'LRU'}
                    >
                        {outlet}
                    </KeepAlive>
                </Suspense>
            </div>
        </div>
    );
}

export default BasicLayoutWithCache;
