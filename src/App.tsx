import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Cashier from './pages/Cashier'
import ProductQuery from './pages/ProductQuery'
import MemberCenter from './pages/MemberCenter'
import Returns from './pages/Returns'
import ShiftSummary from './pages/ShiftSummary'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/cashier" replace />} />
        <Route path="cashier" element={<Cashier />} />
        <Route path="product" element={<ProductQuery />} />
        <Route path="member" element={<MemberCenter />} />
        <Route path="returns" element={<Returns />} />
        <Route path="shift" element={<ShiftSummary />} />
      </Route>
    </Routes>
  )
}

export default App
