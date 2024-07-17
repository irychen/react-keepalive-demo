import { useEffect, useState } from 'react';
import { useEffectOnActive } from '../../../components/KeepAliveProvider';

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

export default Tab2;