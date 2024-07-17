import { lazy, Suspense, useMemo, useState } from 'react';
import KeepAlive, { useKeepaliveRef } from '../../components/KeepAlive';

/**
 * antd 组件的懒加载 select datepicker 之类的 会有问题
 */

const tabs = [
    {
        name: 'Tab1',
        cache: true,
        component: lazy(() => import('./Tab1')),
    },
    {
        name: 'Tab2',
        cache: true,
        component: lazy(() => import('./Tab2')),
    },
    {
        name: 'Tab3',
        cache: false,
        component: lazy(() => import('./Tab3')),
    },
];

function TabsPage() {
    const [activeTab, setActiveTab] = useState('Tab1');

    const page = useMemo(() => {
        return tabs.find(tab => tab.name === activeTab);
    }, [activeTab]);

    const aliveRef = useKeepaliveRef();

    return (
        <div>
            <div>
                <h3 style={{ textAlign: 'center' }}>React Keep Alive Demo Tabs Test</h3>
                <div style={{ textAlign: 'center' }}>
                    <div className={activeTab === 'Tab1' ? 'active tab-bar' : 'tab-bar'} onClick={() => setActiveTab('Tab1')}>
                        Tab1
                    </div>
                    <div className={activeTab === 'Tab2' ? 'active tab-bar' : 'tab-bar'} onClick={() => setActiveTab('Tab2')}>
                        Tab2
                    </div>
                    <div className={activeTab === 'Tab3' ? 'active tab-bar' : 'tab-bar'} onClick={() => setActiveTab('Tab3')}>
                        Tab3
                    </div>
                </div>
                <div
                    className={'methods'}
                    style={{
                        justifyContent: 'center',
                        display: 'flex',
                        marginTop: '10px',
                    }}
                >
                    <button
                        className={'button'}
                        onClick={() => {
                            aliveRef.current?.cleanAllCache();
                        }}
                    >
                        remove all cacheNodes
                    </button>
                    <button
                        style={{
                            margin: '0 10px',
                        }}
                        className={'button'}
                        onClick={() => {
                            aliveRef.current?.cleanOtherCache();
                        }}
                    >
                        remove other cacheNodes
                    </button>
                    <button
                        className={'button'}
                        onClick={() => {
                            console.log(aliveRef.current?.getCaches());
                        }}
                    >
                        print cacheNodes
                    </button>
                </div>
                <div
                    style={{
                        justifyContent: 'center',
                        display: 'flex',
                    }}
                >
                    <Suspense
                     fallback={<div>Loading...</div>}
                    >
                        <KeepAlive
                            aliveRef={aliveRef} max={20} strategy={'PRE'} activeName={activeTab} cache={page?.cache}>
                            {page && <page.component name={page.name} />}
                        </KeepAlive>
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

export default TabsPage;





