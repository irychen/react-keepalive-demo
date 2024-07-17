import { useKeepAliveContext } from '../../../components/KeepAliveProvider';
import { useEffect, useState } from 'react';

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

export default Tab3;