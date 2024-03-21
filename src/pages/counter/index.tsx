import { useState } from 'react';
import { useKeepAliveContext, useOnActive } from '../../components/KeepaAliveProvider';


function Counter() {
    const [count, setCount] = useState(0);

    const { destroy } = useKeepAliveContext();

    useOnActive((active) => {
        console.log(`Counter active: ${active} Count: ${count}`);
        return () => {
            console.log(`Counter cleanup: ${active} Count: ${count}`);
        }
    });


    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <input type="text" />

            <button onClick={() => destroy()}>
                destroy
            </button>
        </div>
    );
}

export default Counter;
