import { useState, useEffect } from 'react';

export const useToast = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const handleShowToast = (event) => {
            setToast(event.detail);
        };
        window.addEventListener('showToast', handleShowToast);
        return () => window.removeEventListener('showToast', handleShowToast);
    }, []);

    const hideToast = () => setToast(null);

    return { toast, hideToast };
};