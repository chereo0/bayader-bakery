import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'
import Card from './ui/Card'
import Input from './ui/Input'

interface SavedAddress {
  _id: string
  label: string
  line1: string
  line2?: string
  city: string
  postalCode?: string
  country: string
  phone: string
  isDefault: boolean
}

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [pickupLocation, setPickupLocation] = useState('')
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [showSaveAddress, setShowSaveAddress] = useState(false)
  const [newAddressLabel, setNewAddressLabel] = useState('')
  const [checkoutData, setCheckoutData] = useState({
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    specialInstructions: '',
  })
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponInput, setCouponInput] = useState('')

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const discountPercent = appliedCoupon === 'SAVE10' ? 10 : appliedCoupon === 'SAVE20' ? 20 : 0
  const discount = (subtotal * discountPercent) / 100
  const tax = (subtotal - discount) * 0.1
  const total = subtotal - discount + tax

  // Fetch saved addresses when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedAddresses()
    }
  }, [isAuthenticated])

  const fetchSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setSavedAddresses(data.data)
        // Select default address if available
        const defaultAddr = data.data.find((addr: SavedAddress) => addr.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id)
          loadAddressToForm(defaultAddr)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const loadAddressToForm = (address: SavedAddress) => {
    setCheckoutData({
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      postalCode: address.postalCode || '',
      country: address.country,
      phone: address.phone,
      specialInstructions: checkoutData.specialInstructions
    })
  }

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    setUseNewAddress(false)
    const address = savedAddresses.find(addr => addr._id === addressId)
    if (address) {
      loadAddressToForm(address)
    }
  }

  const handleUseNewAddress = () => {
    setUseNewAddress(true)
    setSelectedAddressId('')
    setCheckoutData({
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      country: '',
      phone: '',
      specialInstructions: checkoutData.specialInstructions
    })
  }

  const saveCurrentAddress = async () => {
    if (!newAddressLabel) {
      alert('Please enter a label for this address')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          label: newAddressLabel,
          line1: checkoutData.line1,
          line2: checkoutData.line2,
          city: checkoutData.city,
          postalCode: checkoutData.postalCode,
          country: checkoutData.country,
          phone: checkoutData.phone
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Address saved successfully!')
        setShowSaveAddress(false)
        setNewAddressLabel('')
        fetchSavedAddresses()
      }
    } catch (error) {
      console.error('Error saving address:', error)
      alert('Failed to save address')
    }
  }

  const handleApplyCoupon = () => {
    if (couponInput.toUpperCase() === 'SAVE10') {
      setAppliedCoupon('SAVE10')
      setCouponInput('')
    } else if (couponInput.toUpperCase() === 'SAVE20') {
      setAppliedCoupon('SAVE20')
      setCouponInput('')
    } else {
      alert('Invalid coupon code. Try SAVE10 or SAVE20')
      setCouponInput('')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Please log in to checkout')
      navigate('/login')
      return
    }

    // Validate based on order type
    if (orderType === 'delivery') {
      if (!checkoutData.line1 || !checkoutData.city || !checkoutData.country || !checkoutData.phone) {
        alert('Please fill all required delivery fields')
        return
      }
    } else {
      if (!pickupLocation || !checkoutData.phone) {
        alert('Please select a pickup location and provide your phone number')
        return
      }
    }

    if (items.length === 0) {
      alert('Your cart is empty')
      return
    }

    setIsProcessing(true)

    try {
      const token = localStorage.getItem('token')
      
      const orderPayload: any = {
        items: items.map(item => ({
          productId: item.id.toString(),
          quantity: item.quantity
        })),
        isPickup: orderType === 'pickup',
        payment: {
          method: 'cash',
          paid: false
        }
      }

      if (orderType === 'delivery') {
        orderPayload.deliveryAddress = {
          line1: checkoutData.line1,
          line2: checkoutData.line2 || undefined,
          city: checkoutData.city,
          postalCode: checkoutData.postalCode || undefined,
          country: checkoutData.country,
          phone: checkoutData.phone,
        }
      } else {
        orderPayload.pickupLocation = pickupLocation
        orderPayload.phone = checkoutData.phone
      }

      if (checkoutData.specialInstructions) {
        orderPayload.specialInstructions = checkoutData.specialInstructions
      }

      // Log for debugging
      console.log('Order payload being sent:', orderPayload)
      console.log('Item IDs:', items.map(i => ({ id: i.id, type: typeof i.id })))

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderPayload)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order')
      }

      // Save address if requested
      if (showSaveAddress && orderType === 'delivery' && useNewAddress && newAddressLabel) {
        await saveCurrentAddress()
      }

      alert(`Order placed successfully!\nOrder ID: ${data.data._id.slice(-8).toUpperCase()}\nTotal: $${total.toFixed(2)}\n\nThank you for your order!`)
      clearCart()
      setShowCheckoutModal(false)
      navigate('/orders')
    } catch (error) {
      console.error('Checkout error:', error)
      alert(`Error placing order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContinueShopping = () => {
    navigate('/products')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bakery-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-display text-bakery-900 mb-8">Shopping Cart</h1>
          
          <Card className="p-12 text-center">
            <div className="mb-4 text-5xl">🛒</div>
            <h2 className="text-2xl font-display text-bakery-900 mb-2">Your cart is empty</h2>
            <p className="text-bakery-700 mb-6">Looks like you haven't added any items yet. Start browsing our delicious products!</p>
            <Button onClick={handleContinueShopping} className="px-8">
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bakery-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-display text-bakery-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map(item => (
                <Card key={item.id} className="p-4 hover:shadow-md transition">
                  <div className="flex gap-4 items-start">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-bakery-900 mb-1">{item.name}</h3>
                      <p className="text-bakery-700 mb-3">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 bg-bakery-200 text-bakery-900 rounded hover:bg-bakery-300 transition font-semibold"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 bg-bakery-100 rounded text-bakery-900 font-medium min-w-max">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-bakery-200 text-bakery-900 rounded hover:bg-bakery-300 transition font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold text-bakery-900 mb-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded transition font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <Button 
                variant="ghost"
                onClick={handleContinueShopping}
                className="w-full"
              >
                ← Continue Shopping
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 bg-white shadow-lg">
              <h2 className="text-xl font-display text-bakery-900 mb-6">Order Summary</h2>

              {/* Coupon Section */}
              <div className="mb-6 pb-6 border-b border-bakery-200">
                <label className="block text-sm font-medium text-bakery-900 mb-2">Coupon Code</label>
                <div className="flex gap-2 mb-2">
                  <Input 
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput((e.target as HTMLInputElement).value)}
                    className="flex-1 text-sm"
                  />
                  <Button 
                    onClick={handleApplyCoupon}
                    className="px-3 py-1 text-sm"
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-xs text-bakery-600">Try: SAVE10 or SAVE20</p>
                
                {appliedCoupon && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex justify-between items-center">
                    <span className="text-sm text-green-700">✓ {appliedCoupon} applied</span>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-bakery-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-bakery-700">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-bakery-200 flex justify-between">
                  <span className="font-semibold text-bakery-900">Total</span>
                  <span className="text-2xl font-bold text-bakery-900">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Item Count */}
              <div className="text-sm text-bakery-600 mb-6">
                {items.length} item{items.length !== 1 ? 's' : ''} • {items.reduce((sum, i) => sum + i.quantity, 0)} pieces
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full"
                >
                  Proceed to Checkout
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => clearCart()}
                  className="w-full text-red-600 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-display text-bakery-900 mb-4">Order Information</h2>

            <div className="space-y-4 mb-6">
              {/* Order Type Selector */}
              <div>
                <label className="block text-sm font-medium text-bakery-900 mb-2">Order Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`px-4 py-3 rounded-md border-2 font-medium transition-all ${
                      orderType === 'delivery'
                        ? 'border-bakery-700 bg-bakery-50 text-bakery-900'
                        : 'border-bakery-200 bg-white text-bakery-700 hover:border-bakery-400'
                    }`}
                  >
                    🚚 Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`px-4 py-3 rounded-md border-2 font-medium transition-all ${
                      orderType === 'pickup'
                        ? 'border-bakery-700 bg-bakery-50 text-bakery-900'
                        : 'border-bakery-200 bg-white text-bakery-700 hover:border-bakery-400'
                    }`}
                  >
                    🏪 Pickup
                  </button>
                </div>
              </div>

              {/* Pickup Location Selector */}
              {orderType === 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-bakery-900 mb-1">Pickup Location *</label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    title="Select pickup location"
                    aria-label="Pickup location"
                    className="w-full px-3 py-2 border border-bakery-200 rounded-md focus:outline-none focus:ring-2 focus:ring-bakery-700 text-sm"
                  >
                    <option value="">Select a location</option>
                    <option value="main-store">Main Store - 123 Bakery Street, Downtown</option>
                    <option value="west-branch">West Branch - 456 Oak Avenue, West District</option>
                    <option value="east-branch">East Branch - 789 Maple Road, East Side</option>
                  </select>
                  <p className="text-xs text-bakery-600 mt-1">We'll notify you when your order is ready for pickup</p>
                </div>
              )}

              {/* Saved Addresses - Only show for delivery */}
              {orderType === 'delivery' && savedAddresses.length > 0 && !useNewAddress && (
                <div>
                  <label className="block text-sm font-medium text-bakery-900 mb-2">Select Address *</label>
                  <div className="space-y-2 mb-3">
                    {savedAddresses.map(addr => (
                      <button
                        key={addr._id}
                        type="button"
                        onClick={() => handleAddressSelect(addr._id)}
                        className={`w-full text-left px-3 py-2 rounded-md border-2 transition-all ${
                          selectedAddressId === addr._id
                            ? 'border-bakery-700 bg-bakery-50'
                            : 'border-bakery-200 bg-white hover:border-bakery-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-bakery-900">{addr.label}</p>
                            <p className="text-sm text-bakery-700">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                            <p className="text-sm text-bakery-700">{addr.city}, {addr.country}</p>
                            <p className="text-sm text-bakery-600">📞 {addr.phone}</p>
                          </div>
                          {addr.isDefault && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Default</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleUseNewAddress}
                    className="text-sm text-bakery-700 hover:text-bakery-900 underline"
                  >
                    + Use a different address
                  </button>
                </div>
              )}

              {/* Delivery Address Fields - Only show for delivery and when using new address or no saved addresses */}
              {orderType === 'delivery' && (savedAddresses.length === 0 || useNewAddress) && (
                <>
              <div>
                <label className="block text-sm font-medium text-bakery-900 mb-1">Address Line 1 *</label>
                <Input 
                  placeholder="Street address"
                  value={checkoutData.line1}
                  onChange={(e) => setCheckoutData({...checkoutData, line1: (e.target as HTMLInputElement).value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bakery-900 mb-1">Address Line 2</label>
                <Input 
                  placeholder="Apartment, suite, etc. (optional)"
                  value={checkoutData.line2}
                  onChange={(e) => setCheckoutData({...checkoutData, line2: (e.target as HTMLInputElement).value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-bakery-900 mb-1">City *</label>
                  <Input 
                    placeholder="City"
                    value={checkoutData.city}
                    onChange={(e) => setCheckoutData({...checkoutData, city: (e.target as HTMLInputElement).value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bakery-900 mb-1">Postal Code</label>
                  <Input 
                    placeholder="ZIP/Postal code"
                    value={checkoutData.postalCode}
                    onChange={(e) => setCheckoutData({...checkoutData, postalCode: (e.target as HTMLInputElement).value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bakery-900 mb-1">Country *</label>
                <Input 
                  placeholder="Country"
                  value={checkoutData.country}
                  onChange={(e) => setCheckoutData({...checkoutData, country: (e.target as HTMLInputElement).value})}
                />
              </div>

              {/* Save Address Checkbox */}
              {!showSaveAddress && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={showSaveAddress}
                    onChange={(e) => setShowSaveAddress(e.target.checked)}
                    className="w-4 h-4 text-bakery-700 border-bakery-300 rounded focus:ring-bakery-700"
                  />
                  <label htmlFor="saveAddress" className="text-sm text-bakery-700">
                    Save this address for future orders
                  </label>
                </div>
              )}

              {/* Address Label Input */}
              {showSaveAddress && (
                <div>
                  <label className="block text-sm font-medium text-bakery-900 mb-1">Address Label *</label>
                  <Input 
                    placeholder="e.g., Home, Work, etc."
                    value={newAddressLabel}
                    onChange={(e) => setNewAddressLabel((e.target as HTMLInputElement).value)}
                  />
                  <p className="text-xs text-bakery-600 mt-1">Give this address a name for easy selection later</p>
                </div>
              )}

                </>
              )}

              {/* Phone Number - Always required */}
              <div>
                <label className="block text-sm font-medium text-bakery-900 mb-1">Phone Number *</label>
                <Input 
                  type="tel"
                  placeholder="Your phone number"
                  value={checkoutData.phone}
                  onChange={(e) => setCheckoutData({...checkoutData, phone: (e.target as HTMLInputElement).value})}
                />
              </div>

              {/* Special Instructions - Always available */}
              <div>
                <label className="block text-sm font-medium text-bakery-900 mb-1">Special Instructions</label>
                <textarea 
                  placeholder="Any special requests? (optional)"
                  value={checkoutData.specialInstructions}
                  onChange={(e) => setCheckoutData({...checkoutData, specialInstructions: e.target.value})}
                  className="w-full px-3 py-2 border border-bakery-200 rounded-md focus:outline-none focus:ring-2 focus:ring-bakery-700 text-sm"
                  rows={2}
                />
              </div>
            </div>

            {/* Order Summary in Modal */}
            <div className="bg-bakery-50 p-4 rounded-md mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-bakery-700">Subtotal:</span>
                <span className="text-bakery-900 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm mb-2 text-green-600">
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm mb-2 border-t border-bakery-200 pt-2">
                <span className="text-bakery-700">Tax:</span>
                <span className="text-bakery-900 font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-bakery-900 pt-2 border-t border-bakery-200">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setShowCheckoutModal(false)}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CartPage
