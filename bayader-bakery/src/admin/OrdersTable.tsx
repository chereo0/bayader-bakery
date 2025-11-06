import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const OrdersTable: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const { token } = useAuth()
  const [orders, setOrders] = useState<any[]>([])

  useEffect(()=>{
    const load = async ()=>{
      try{
        console.debug('OrdersTable token:', token)
        if (!token) return
        const headers = { Authorization: `Bearer ${token}` }
        const res = await fetch(`${API_URL}/orders?limit=5`, { headers })
        if (!res.ok) return
        const j = await res.json()
        if (j && j.success && j.data && Array.isArray(j.data.orders)) {
          setOrders(j.data.orders)
        }
      }catch(err){
        console.error('Failed to load recent orders', err)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-medium text-[#5E372E] mb-4">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="py-2">Order ID</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o:any) => (
              <tr key={o._id} className="border-t">
                <td className="py-2 font-medium">{o._id}</td>
                <td className="py-2">{o.user?.name ?? o.user?.email ?? '—'}</td>
                <td className="py-2">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrdersTable
