import { useEffect, useRef } from 'react';

const useInterval = (callback: Function, delay: number | null) => {

    const savedCallback = useRef<null | HTMLElement | any>(null);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const tick = () => { savedCallback.current();}
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export default useInterval;