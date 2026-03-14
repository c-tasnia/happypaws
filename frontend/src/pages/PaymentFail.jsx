import { Link } from 'react-router-dom'

export default function PaymentFail() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-xl pop-in">
        <div className="text-7xl mb-5">😿</div>
        <h1 className="font-serif text-4xl mb-3">Payment Cancelled</h1>
        <p className="text-muted mb-8">No money was charged. The animals are still waiting — try again!</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-dark transition-colors">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  )
}
