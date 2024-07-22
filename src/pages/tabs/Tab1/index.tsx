import { useEffect, useState } from 'react';
import { useKeepAliveContext } from '../../../components/KeepAliveProvider';
import { DatePicker, Select } from 'antd';

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
                <DatePicker></DatePicker>
                <DatePicker
                    getPopupContainer={trigger => {
                        return trigger.parentNode as HTMLElement;
                    }}
                ></DatePicker>
                <DatePicker.RangePicker></DatePicker.RangePicker>
                <Select
                    style={{
                        width: 120,
                    }}
                ></Select>
            </div>
            <div>
                <video src="https://www.w3schools.com/tags/mov_bbb.mp4" style={{ width: '100%' }} controls={true} />
            </div>
            <div>
                <iframe width={1000} height={500} src="https://www.youdao.com"></iframe>
            </div>
        </div>
    );
}

export default Tab1;
