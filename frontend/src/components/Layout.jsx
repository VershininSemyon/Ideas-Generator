import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import Button from './ui/Button.jsx';
import Toast from './ui/Toast.jsx';

export default function Layout() {
    const { user, logout } = useAuth();
    const { toast, hideToast } = useToast();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="text-xl font-bold text-blue-600">Ideas Generator</Link>
                        <nav className="flex space-x-4">
                            {user ? (
                                <>
                                    <Link to="/ideas" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Идеи</Link>
                                    <Link to="/ideas/stats" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Статистика</Link>
                                    <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Профиль</Link>
                                    <Button variant="secondary" onClick={handleLogout}>Выйти</Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Вход</Link>
                                    <Link to="/register" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Регистрация</Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Outlet />
            </main>
        </div>
    );
}