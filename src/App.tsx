import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import MenuGrid from './components/MenuGrid'
import Contact from './components/Contact'
import Footer from './components/Footer'
import SignupPage from './components/SignupPage'
import LoginPage from './components/LoginPage'
import ProductsPage from './components/ProductsPage'
import CartPage from './components/CartPage'
import Toast from './components/Toast'
import { CartProvider } from './context/CartContext'
import ProductDetailsPage from './components/ProductDetailsPage'

export default function App(){
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
            <Route path="/" element={
              <div>
                <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <Hero />
                </section>

                <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <About />
                </section>

                <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <MenuGrid />
                </section>

                <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <Contact />
                </section>
              </div>
            } />

            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
          </main>
          <Footer />
          <Toast />
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}
