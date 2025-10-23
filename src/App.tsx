import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import MenuGrid from './components/MenuGrid'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
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
      </main>
      <Footer />
    </div>
  )
}
