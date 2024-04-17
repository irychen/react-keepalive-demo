import { useState } from 'react';
import { useKeepAliveContext, useEffectOnActive } from '../../components/KeepaAliveProvider';

function ExcludeCounter() {
    const [count, setCount] = useState(0);

    const { destroy } = useKeepAliveContext();

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

    return (
        <div>
            <p>Exclude Counter: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <input type="text" />

            <button onClick={() => destroy()}>destroy</button>
        </div>
    );
}

export default ExcludeCounter;
