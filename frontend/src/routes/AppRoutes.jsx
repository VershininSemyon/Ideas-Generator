import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Ideas from '../pages/Ideas.jsx';
import IdeaCreate from '../pages/IdeaCreate.jsx';
import IdeaDetail from '../pages/IdeaDetail.jsx';
import IdeaStats from '../pages/IdeaStats.jsx';
import Profile from '../pages/Profile.jsx';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                
                <Route path="ideas" element={
                    <ProtectedRoute>
                        <Ideas />
                    </ProtectedRoute>
                } />
                <Route path="ideas/new" element={
                    <ProtectedRoute>
                        <IdeaCreate />
                    </ProtectedRoute>
                } />
                <Route path="ideas/:id" element={
                    <ProtectedRoute>
                        <IdeaDetail />
                    </ProtectedRoute>
                } />
                <Route path="ideas/stats" element={
                    <ProtectedRoute>
                        <IdeaStats />
                    </ProtectedRoute>
                } />
                <Route path="profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
            </Route>
        </Routes>
    );
}