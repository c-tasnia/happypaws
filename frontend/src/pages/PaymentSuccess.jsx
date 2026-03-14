import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { donationsAPI } from '../api'

export default function PaymentSuccess() {
  const [params]  = useSearchParams()
  const [status,  setStatus]  = useState('verifying')
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const tran_id = params.get('tran_id')
    if (!tran_id) { setStatus('failed'); return }
    donationsAPI.verify(tran_id)
      .then(res => { setDetails(res.data); setStatus('success') })
      .catch(()  => setStatus('failed'))
  }, [])

  if (status === 'verifying') return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🐾</div>
        <p className="text-muted">Verifying your payment...</p>
      </div>
    </div>
  )

  if (status === 'failed') return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-xl pop-in">
        <div className="text-6xl mb-4">😔</div>
        <h1 className="font-serif text-3xl mb-3">Payment Failed</h1>
        <p className="text-muted mb-8">Your payment was not processed. No money was charged.</p>
        <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-dark transition-colors">
          Try Again
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-xl pop-in">
        <div className="w-20 h-20 bg-light rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🎉</div>
        <h1 className="font-serif text-4xl mb-2 text-dark">Thank You!</h1>
        <p className="text-muted mb-8">Your donation is making a real difference for an animal in need.</p>

        {details && (
          <div className="bg-cream rounded-2xl p-5 text-left mb-8 space-y-3">
            {[
              ['Donated to', details.pet_name || 'General Fund'],
              ['Amount',     `৳${Number(details.amount).toLocaleString()}`],
              ['Donor',      details.donor_name],
              ['Transaction', details.tran_id],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-muted">{k}</span>
                <span className="font-semibold text-dark">{v}</span>
              </div>
            ))}
          </div>
        )}

        <Link to="/" className="inline-block bg-primary text-white px-10 py-3.5 rounded-full font-medium hover:bg-dark transition-colors">
          Donate Again
        </Link>
      </div>
    </div>
  )
}
