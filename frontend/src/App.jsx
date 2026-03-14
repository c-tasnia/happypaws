import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import DonationPage    from './pages/DonationPage'
import PaymentSuccess  from './pages/PaymentSuccess'
import PaymentFail     from './pages/PaymentFail'
import Toast           from './components/Toast'

export default function App() {
  const [toast, setToast] = useState({ msg: '', visible: false, error: false })

  const showToast = (msg, error = false) => {
    setToast({ msg, visible: true, error })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500)
  }

  return (
    <>
      <Routes>
        <Route path="/"                 element={<DonationPage showToast={showToast} />} />
        <Route path="/payment/success"  element={<PaymentSuccess />} />
        <Route path="/payment/fail"     element={<PaymentFail />} />
      </Routes>
      <Toast msg={toast.msg} visible={toast.visible} error={toast.error} />
    </>
  )
}
