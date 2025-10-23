import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Link } from 'react-router-dom'

const LoginPage: React.FC = () => {
  const formRef = useRef<HTMLDivElement | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const dotsRef = useRef<Array<HTMLDivElement | null>>([])
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const subheadingRef = useRef<HTMLParagraphElement | null>(null)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Page fade in
    gsap.fromTo(
      '.login-page-container',
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    )

    // Heading slide up and fade in
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 }
      )
    }

    if (subheadingRef.current) {
      gsap.fromTo(
        subheadingRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.4 }
      )
    }

    // Form entrance and input stagger
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.5 }
      )
      const inputs = inputRefs.current.filter(Boolean) as HTMLElement[]
      if (inputs.length) {
        gsap.fromTo(
          inputs,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.7 }
        )
      }
    }

    // Dotted decorative subtle parallax loop
    const dots = dotsRef.current.filter(Boolean) as HTMLElement[]
    if (dots.length) {
      gsap.to(dots, {
        yPercent: -6,
        repeat: -1,
        yoyo: true,
        duration: 6,
        ease: 'sine.inOut',
        stagger: { each: 0.5 },
      })
    }
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!/^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.password || form.password.length < 6) next.password = 'Password must be 6+ chars'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    setSuccess(null)
    if (!validate()) return
    // fake login flow
    setTimeout(() => {
      setSuccess('Welcome back to Sweet Delight!')
      setForm({ email: '', password: '' })
      setErrors({})
    }, 600)
  }

  // helper to set multiple refs for dynamic arrays
  const setRef = <T extends HTMLElement>(collection: React.MutableRefObject<Array<T | null>>, idx: number) => (el: T | null) => {
    collection.current[idx] = el
  }

  return (
    <div className="login-page-container min-h-screen bg-[#F5F1E8] text-brown-900 relative overflow-x-hidden pt-8">
      {/* Decorative dotted clusters */}
      <div
        ref={setRef(dotsRef, 0)}
        className="pointer-events-none absolute top-24 left-12 opacity-60 transform-gpu"
        aria-hidden
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#7B4A3D">
            {[...Array(15)].map((_, i) => {
              const angle = (i / 15) * Math.PI * 2
              const r = 25 + Math.sin(i) * 5
              const x = 50 + Math.cos(angle) * r
              const y = 50 + Math.sin(angle) * r
              return <circle key={i} cx={x} cy={y} r={2.5} />
            })}
          </g>
        </svg>
      </div>

      <div
        ref={setRef(dotsRef, 1)}
        className="pointer-events-none absolute top-32 right-8 opacity-50 transform-gpu scale-75"
        aria-hidden
      >
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#C89A5A">
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2
              const r = 20 + Math.cos(i) * 3
              const x = 45 + Math.cos(angle) * r
              const y = 45 + Math.sin(angle) * r
              return <circle key={i} cx={x} cy={y} r={2} />
            })}
          </g>
        </svg>
      </div>

      <div
        ref={setRef(dotsRef, 2)}
        className="pointer-events-none absolute bottom-32 left-16 opacity-40 transform-gpu"
        aria-hidden
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#8B6F47">
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2
              const r = 18
              const x = 40 + Math.cos(angle) * r
              const y = 40 + Math.sin(angle) * r
              return <circle key={i} cx={x} cy={y} r={2.5} />
            })}
          </g>
        </svg>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <section className="flex flex-col items-center">
          {/* Croissant icon placeholder */}
          <div className="mb-4 text-6xl" aria-label="Croissant icon">
            🥐
          </div>

          <h1 ref={headingRef} className="text-4xl md:text-5xl font-display mb-2 text-[#5E372E]">
            Welcome Back
          </h1>
          <p ref={subheadingRef} className="text-sm text-[#6b4f45] mb-8">
            Log in to access your sweet deals
          </p>

          <div ref={formRef} className="w-full md:w-2/3 lg:w-1/2 bg-white/95 rounded-xl shadow-lg p-6 md:p-10">
            <h2 className="text-2xl font-display text-center mb-6 text-[#5E372E]">Log In</h2>
            
            <form onSubmit={onSubmit} aria-label="Login form">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#6b4f45] mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    ref={(el) => (inputRefs.current[0] = el)}
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    type="email"
                    className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6b4f45] mb-1" htmlFor="password">
                    Password
                  </label>
                  <input
                    ref={(el) => (inputRefs.current[1] = el)}
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    type="password"
                    className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]"
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && <p className="text-rose-600 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  className="bg-[#6b3f2f] hover:bg-[#5a3426] text-white px-8 py-2 rounded-md shadow-md transform transition-transform hover:scale-105 w-full md:w-auto"
                >
                  Log In
                </button>
              </div>

              <p className="text-sm text-[#5e463f] mt-4 text-center">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#6b3f2f] underline font-medium">
                  Sign Up
                </Link>
              </p>

              {success && <div className="mt-4 text-green-700 text-center">{success}</div>}
            </form>
          </div>
        </section>

        {/* Footer showcase with colored div placeholders */}
        <footer 
          className="mt-14 rounded-xl overflow-hidden"
          style={{
            backgroundImage: 'url(/images/bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-[#5e463f]">
                Address: 8 Addis Corel Sison / Visitors Preset By 0123-456-7890
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex gap-3">
                <a href="#" aria-label="Facebook" className="text-[#3b5998] hover:opacity-80">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Twitter" className="text-[#1DA1F2] hover:opacity-80">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-pink-600 hover:opacity-80">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
              <div className="text-xs text-[#6b4f45]">
                UdScree. Dsight. Latch - Room 5. com | Togfl Granler
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default LoginPage
