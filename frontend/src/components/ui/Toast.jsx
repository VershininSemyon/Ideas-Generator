import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
    };

    return (
        <div className={`fixed top-4 right-4 ${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down`}>
            {message}
        </div>
    );
}