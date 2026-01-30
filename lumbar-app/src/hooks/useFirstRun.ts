// M13: First-Run Detection Hook
import { useState, useEffect } from 'react';

const FIRST_RUN_KEY = 'lumbar_first_run_completed';

export const useFirstRun = () => {
    const [isFirstRun, setIsFirstRun] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkFirstRun = () => {
            const completed = localStorage.getItem(FIRST_RUN_KEY);
            setIsFirstRun(!completed);
            setIsLoading(false);
        };
        checkFirstRun();
    }, []);

    const completeFirstRun = () => {
        localStorage.setItem(FIRST_RUN_KEY, 'true');
        setIsFirstRun(false);
    };

    const resetFirstRun = () => {
        localStorage.removeItem(FIRST_RUN_KEY);
        setIsFirstRun(true);
    };

    return { isFirstRun, isLoading, completeFirstRun, resetFirstRun };
};
