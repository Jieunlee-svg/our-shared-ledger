import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 새 라우트는 여기에 추가 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
