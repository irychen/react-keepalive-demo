import { useEffect, useState } from 'react';
import useEffectOnActive from '../../../hooks/useEffectOnActive';

function Tab2(props: any) {
    console.log('Tab2 rendered', props.name);
    const [count, setCount] = useState(0);
    const [inputText, setInputText] = useState('');

    useEffectOnActive(() => {
        console.log('Tab2 useEffectOnActive inputText', inputText);
        return () => {
            console.log('Tab2 useEffectOnActive cleanup', inputText);
        };
    }, [inputText]);

    useEffect(() => {
        console.log('Tab2 useEffect inputText raw', inputText);
        return () => {
            console.log('Tab2 useEffect cleanup raw', inputText);
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
