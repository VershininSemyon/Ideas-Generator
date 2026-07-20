
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
            
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            Ideas Generator
                        </Link>
                        <nav className="flex items-center space-x-2 sm:space-x-4">
                            {user ? (
                                <>
                                    <Link to="/ideas" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Идеи
                                    </Link>
                                    <Link to="/ideas/stats" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Статистика
                                    </Link>
                                    <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Профиль
                                    </Link>
                                    <Button variant="secondary" onClick={handleLogout} className="ml-2">
                                        Выйти
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Главная
                                    </Link>
                                    <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Вход
                                    </Link>
                                    <Link to="/register">
                                        <Button className="ml-2">Регистрация</Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            
            <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Ideas Generator. Все права защищены.
                </div>
            </footer>
        </div>
    );
}
