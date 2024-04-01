import { Link, useLocation, useOutlet } from 'react-router-dom';
import { useMemo } from 'react';
import KeepAlive from '../../components/KeepAlive';

function BasicLayoutWithCache() {

    const outlet = useOutlet();
    const location = useLocation();

    /**
     * to distinguish different pages to cache
     */
    const cacheKey = useMemo(() => {
        return location.pathname + location.search;
    }, [location]);

    return (
        <div>
            <h4>BasicLayout With Cache Router Example</h4>
            <Link to={'/counter'} style={{
                marginRight: 5,
            }} >
                <button className={'button'}>Counter</button>
            </Link>
            <Link to={'/counter2'} style={{
                marginRight: 5,
            }} >
                <button className={'button'}>Counter2</button>
            </Link>
            {/*exclude-counter*/}
            <Link to={'/exclude-counter'} style={{
                marginRight: 5,
            }} >
                <button className={'button'}>Exclude Counter</button>
            </Link>

            <Link to={'/tabs'} style={{
                marginRight: 5,
            }} >
                <button className={'button'}>Tabs</button>
            </Link>
            <div>
                <KeepAlive activeName={cacheKey}
                           exclude={[/\/exclude-counter/]}
                           max={10} strategy={'LRU'}>
                    {outlet}
                </KeepAlive>
            </div>
        </div>
    );
}


export default BasicLayoutWithCache;