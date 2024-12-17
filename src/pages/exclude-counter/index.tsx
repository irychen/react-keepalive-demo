import { useState } from 'react';
import useEffectOnActive from '../../hooks/useEffectOnActive';
import useKeepAliveContext from '../../hooks/useKeepAliveContext';

function ExcludeCounter() {
    const [count, setCount] = useState(0);

    const { destroy } = useKeepAliveContext();

    useEffectOnActive(() => {
        console.log(`Counter active: Count: ${count}`);
        return () => {
            console.log(`Counter cleanup: Count: ${count}`);
        };
    }, [count]);

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
