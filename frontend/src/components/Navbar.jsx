import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/campaigns', label: 'Campaigns' },
    { to: '/customers', label: 'Customers' },
    { to: '/analytics', label: 'Analytics' },
  ]

  return (
    <nav className="bg-blue-900 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-300">XENO</span>
          <span className="text-white font-medium">Mini CRM</span>
        </div>
        <div className="flex gap-6">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium hover:text-blue-300 transition-colors ${
                location.pathname === link.to ? 'text-blue-300 border-b-2 border-blue-300 pb-1' : 'text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}