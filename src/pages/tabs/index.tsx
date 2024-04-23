import { useEffect, useMemo, useState } from 'react';
import { useKeepAliveContext, useEffectOnActive } from '../../components/KeepaAliveProvider';
import KeepAlive, { useKeepaliveRef } from '../../components/KeepAlive';

const tabs = [
    {
        name: 'Tab1',
        cache: true,
        component: Tab1,
    },
    {
        name: 'Tab2',
        cache: true,
        component: Tab2,
    },
    {
        name: 'Tab3',
        cache: false,
        component: Tab3,
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

                    <button
                        style={{
                            margin: '0 10px',
                        }}
                        className={'button'}
                        onClick={() => {
                            aliveRef.current?.refresh();
                        }}
                    >
                        refresh current cache
                    </button>
                </div>
                <div
                    style={{
                        justifyContent: 'center',
                        display: 'flex',
                    }}
                >
                    <KeepAlive aliveRef={aliveRef} max={20} strategy={'PRE'} activeName={activeTab} cache={page?.cache}>
                        {page && <page.component name={page.name} />}
                    </KeepAlive>
                </div>
            </div>
        </div>
    );
}

export default TabsPage;

function Tab1(props: any) {
    const [count, setCount] = useState(0);
    const [inputText, setInputText] = useState('');

    console.log('Tab1 rendered', props.name);

    const { active, destroy } = useKeepAliveContext();

    useEffect(() => {
        console.log('Tab1 active', active);
    }, [active]);

    useEffect(() => {
        console.log('Tab1 mounted');
    }, []);

    return (
        <div>
            <h4 style={{ textAlign: 'center' }}>Tab1</h4>
            <div className={'flex flex-col justify-center'}>
                <button className={'button'} onClick={() => setCount(count + 1)}>
                    count: {count}
                </button>

                <button
                    className={'button'}
                    style={{
                        marginTop: '10px',
                    }}
                    onClick={() => destroy()}
                >
                    destroy
                </button>
                <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="input something" />
            </div>
            <div>
                <video src="https://www.w3schools.com/tags/mov_bbb.mp4" style={{ width: '100%' }} controls={true} />
            </div>
        </div>
    );
}

function Tab2(props: any) {
    console.log('Tab2 rendered', props.name);
    const [count, setCount] = useState(0);
    const [inputText, setInputText] = useState('');

    useEffectOnActive(
        active => {
            console.log('Tab2 active ---useOnActive---', active);
            console.log('inputText', inputText);
            return () => {
                console.log('Tab2 cleanup', inputText, active);
            };
        },
        true,
        [inputText],
    );

    useEffect(() => {
        console.log('inputText raw', inputText);
        return () => {
            console.log('Tab2 cleanup raw', inputText);
        };
    }, [inputText]);

    return (
        <div>
            <h4 style={{ textAlign: 'center' }}>Tab2</h4>
            <div className={'flex flex-col justify-center'}>
                <button className={'button'} onClick={() => setCount(count + 1)}>
                    count: {count}
                </button>
                <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="input something" />
            </div>
        </div>
    );
}

function Tab3(props: any) {
    console.log('Tab3 rendered', props.name);

    const { active } = useKeepAliveContext();

    useEffect(() => {
        console.log('Tab3 active', active);
    }, [active]);

    useEffect(() => {
        console.log('Tab3 mounted');
    }, []);

    const [count, setCount] = useState(0);
    const [inputText, setInputText] = useState('');
    return (
        <div>
            <h4 style={{ textAlign: 'center' }}>Tab3 nocache</h4>
            <div className={'flex flex-col justify-center'}>
                <button className={'button'} onClick={() => setCount(count + 1)}>
                    count: {count}
                </button>
                <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="input something" />
            </div>
        </div>
    );
}
