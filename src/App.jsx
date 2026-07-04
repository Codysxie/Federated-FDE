import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AuthSwitch from './pages/AuthSwitch';
import FdeDetail from './pages/FdeDetail';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import ArticleEditor from './pages/ArticleEditor';
import EnterpriseResources from './pages/EnterpriseResources';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthSwitch />} />
        <Route path="/register" element={<AuthSwitch />} />

        {/* Protected: FDE Detail */}
        <Route path="/fde/:userId" element={
          <ProtectedRoute><FdeDetail /></ProtectedRoute>
        } />

        {/* Protected: Articles */}
        <Route path="/articles" element={
          <ProtectedRoute><Articles /></ProtectedRoute>
        } />
        <Route path="/articles/new" element={
          <ProtectedRoute><ArticleEditor /></ProtectedRoute>
        } />
        <Route path="/articles/:id" element={
          <ProtectedRoute><ArticleDetail /></ProtectedRoute>
        } />
        <Route path="/articles/:id/edit" element={
          <ProtectedRoute><ArticleEditor /></ProtectedRoute>
        } />

        {/* Protected: Enterprise Resources */}
        <Route path="/resources" element={
          <ProtectedRoute><EnterpriseResources /></ProtectedRoute>
        } />

        {/* Protected: Profile */}
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        {/* Protected: Admin */}
        <Route path="/admin" element={
          <ProtectedRoute><Admin /></ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}
