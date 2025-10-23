import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

const SignupPage: React.FC = () => {
  const formRef = useRef<HTMLDivElement | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const dotsRef = useRef<Array<HTMLDivElement | null>>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    email2: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Form entrance and input stagger  
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      const inputs = inputRefs.current.filter(Boolean) as HTMLElement[];
      if (inputs.length) {
        gsap.fromTo(
          inputs,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.6, ease: "power2.out", delay: 0.2 }
        );
      }
    }

    // Dotted decorative subtle parallax loop
    const dots = dotsRef.current.filter(Boolean) as HTMLElement[];
    if (dots.length) {
      gsap.to(dots, {
        yPercent: -6,
        repeat: -1,
        yoyo: true,
        duration: 6,
        ease: "sine.inOut",
        stagger: { each: 0.5 },
      });
    }
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = "First name required";
    if (!form.lastName.trim()) next.lastName = "Last name required";
    if (!/^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/.test(form.email))
      next.email = "Enter a valid email";
    if (!form.password || form.password.length < 6)
      next.password = "Password must be 6+ chars";
    if (form.password !== form.confirm) next.confirm = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSuccess(null);
    if (!validate()) return;
    // fake submit flow
    setTimeout(() => {
      setSuccess("Account created — welcome to Sweet Delight!");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        email2: "",
        password: "",
        confirm: "",
      });
      setErrors({});
    }, 600);
  };

  // helper to set multiple refs for dynamic arrays
  const setRef =
    <T extends HTMLElement>(
      collection: React.MutableRefObject<Array<T | null>>,
      idx: number
    ) =>
    (el: T | null) => {
      collection.current[idx] = el;
    };

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-brown-900 relative overflow-x-hidden pt-8">
      {/* Decorative dotted clusters */}
      <div
        ref={setRef(dotsRef, 0)}
        className="pointer-events-none absolute top-12 left-8 opacity-60 transform-gpu"
        aria-hidden
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#7B4A3D">
            {[...Array(18)].map((_, i) => {
              const angle = (i / 18) * Math.PI * 2;
              const r = 30 + Math.sin(i) * 6;
              const x = 60 + Math.cos(angle) * r;
              const y = 60 + Math.sin(angle) * r;
              return <circle key={i} cx={x} cy={y} r={3} />;
            })}
          </g>
        </svg>
      </div>

      <div
        ref={setRef(dotsRef, 1)}
        className="pointer-events-none absolute bottom-40 right-6 opacity-50 transform-gpu scale-90"
        aria-hidden
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#C89A5A">
            {[...Array(10)].map((_, i) => {
              const angle = (i / 10) * Math.PI * 2;
              const r = 22 + Math.cos(i) * 4;
              const x = 48 + Math.cos(angle) * r;
              const y = 48 + Math.sin(angle) * r;
              return <circle key={i} cx={x} cy={y} r={2.5} />;
            })}
          </g>
        </svg>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <section className="flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-display mb-2 text-[#5E372E]">
            Create Your Sweet Delight Account
          </h1>
          <p className="text-sm text-[#6b4f45] mb-8">
            Savor and indulge a delicious goods
          </p>

          <div
            ref={formRef}
            className="w-full md:w-3/4 lg:w-2/3 bg-white/95 rounded-xl shadow-lg p-6 md:p-10"
          >
            <form onSubmit={onSubmit} aria-label="Sign up form">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-xs font-medium text-[#6b4f45] mb-1"
                    htmlFor="firstName"
                  >
                    First Name
                  </label>
                  <input
                    ref={(el) => (inputRefs.current[0] = el)}
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]"
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className="text-rose-600 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-[#6b4f45] mb-1"
                    htmlFor="lastName"
                  >
                    Last Name
                  </label>
                  <input
                    ref={(el) => (inputRefs.current[1] = el)}
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]"
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className="text-rose-600 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-[#6b4f45] mb-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    ref={(el) => (inputRefs.current[2] = el)}
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    type="email"
                    className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-rose-600 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-xs font-medium text-[#6b4f45] mb-1"
                    htmlFor="email2"
                  >
                    Email
                  </label>
                  <input
                    ref={(el) => (inputRefs.current[3] = el)}
                    id="email2"
                    name="email2"
                    value={form.email2}
                    onChange={onChange}
                    type="email"
                    className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-[#6b4f45] mb-1"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    ref={(el) => (inputRefs.current[4] = el)}
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    type="password"
                    className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]"
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-rose-600 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-[#6b4f45] mb-1"
                    htmlFor="confirm"
                  >
                    Password
                  </label>
                  <input
                    ref={(el) => (inputRefs.current[5] = el)}
                    id="confirm"
                    name="confirm"
                    value={form.confirm}
                    onChange={onChange}
                    type="password"
                    className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]"
                    aria-invalid={!!errors.confirm}
                  />
                  {errors.confirm && (
                    <p className="text-rose-600 text-xs mt-1">
                      {errors.confirm}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row items-center gap-4">
                <button
                  type="submit"
                  onClick={(e) => onSubmit(e)}
                  className="bg-[#6b3f2f] hover:bg-[#5a3426] text-white px-6 py-2 rounded-md shadow-md transform transition-transform hover:scale-105 w-full md:w-auto"
                >
                  Sign Up
                </button>

                <button
                  type="button"
                  onClick={() => alert("Secondary call-to-action")}
                  className="bg-[#8b5e45] hover:bg-[#75513e] text-white px-6 py-2 rounded-md shadow-md transform transition-transform hover:scale-105 w-full md:w-auto"
                >
                  Sign Up
                </button>
              </div>

              <p className="text-sm text-[#5e463f] mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-[#6b3f2f] underline font-medium">
                  Log In
                </Link>
              </p>

              {success && <div className="mt-4 text-green-700">{success}</div>}
            </form>
          </div>
        </section>

        {/* Footer showcase */}
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
                Address: 8 Raddy Central Sicon Jakarta - Hotel By: 0123-456-7890
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                <a href="#" aria-label="Facebook" className="text-[#3b5998]">
                  FB
                </a>
                <a href="#" aria-label="Twitter" className="text-[#1DA1F2]">
                  TW
                </a>
                <a href="#" aria-label="Instagram" className="text-pink-600">
                  IG
                </a>
              </div>
              <div className="text-xs text-[#6b4f45]">
                LeBrown Delight | Link: Tasset & Icons
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SignupPage;
