import { useEffect, useRef, useState } from 'react';
import { useEffectOnActive, useKeepAliveContext } from '../../components/KeepAliveProvider';
import { DatePicker, Select } from 'antd';

function Counter() {
    const [count, setCount] = useState(0);

    const { destroy } = useKeepAliveContext();
    const domRef = useRef<HTMLDivElement>(null);

    useEffectOnActive(
        active => {
            console.log(`Counter active: ${active} Count: ${count}`);
            return () => {
                console.log(`Counter cleanup: ${active} Count: ${count}`);
            };
        },
        true,
        [count],
    );

    useEffect(() => {
        // log height and width of the div
        const dom = domRef.current;
        if (dom) {
            console.log(`div height: ${dom.clientHeight} width: ${dom.clientWidth}`);
        }
    }, []);

    return (
        <div ref={domRef}>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <input type="text" />
            <div>
                <DatePicker></DatePicker>
                <DatePicker.RangePicker></DatePicker.RangePicker>
                <Select
                    style={{
                        width: 120,
                    }}
                ></Select>
            </div>
            <button onClick={() => destroy()}>destroy</button>
        </div>
    );
}

export default Counter;
