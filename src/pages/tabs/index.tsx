import { lazy, Suspense, useMemo, useState } from 'react';
import KeepAlive, { useKeepAliveRef } from '../../components/KeepAlive';
import { Space } from 'antd';

/**
 * antd 组件的懒加载 select datepicker 之类的 会有问题
 */

const tabs = [
    {
        name: 'Tab1',
        component: lazy(() => import('./Tab1')),
    },
    {
        name: 'Tab2',
        component: lazy(() => import('./Tab2')),
    },
    {
        name: 'Tab3',
        component: lazy(() => import('./Tab3')),
    },
];

function TabsPage() {
    const [activeTab, setActiveTab] = useState('Tab1');

    const page = useMemo(() => {
        return tabs.find(tab => tab.name === activeTab);
    }, [activeTab]);

    const aliveRef = useKeepAliveRef();

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
                    <Space>
                        <button
                            className={'button'}
                            onClick={() => {
                                aliveRef.current?.destroyAll();
                            }}
                        >
                            remove all cacheNodes
                        </button>
                        <button
                            className={'button'}
                            onClick={() => {
                                aliveRef.current?.destroyOther();
                            }}
                        >
                            remove other cacheNodes
                        </button>
                        <button
                            className={'button'}
                            onClick={() => {
                                console.log(aliveRef.current?.getCacheNodes());
                            }}
                        >
                            print cacheNodes
                        </button>

                        {/* refresh */}
                        <button
                            className={'button'}
                            onClick={() => {
                                aliveRef.current?.refresh();
                            }}
                        >
                            refresh
                        </button>
                        {/* refresh */}
                        <button
                            className={'button'}
                            onClick={() => {
                                aliveRef.current?.refresh('Tab2');
                            }}
                        >
                            refresh Tab2
                        </button>
                    </Space>
                </div>
                <div
                    style={{
                        justifyContent: 'center',
                        display: 'flex',
                    }}
                >
                    <Suspense>
                        <KeepAlive aliveRef={aliveRef} max={20} exclude={['Tab3']} activeCacheKey={activeTab}>
                            {page && <page.component name={page.name} />}
                        </KeepAlive>
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

export default TabsPage;
