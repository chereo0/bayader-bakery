import { useEffect, useRef } from 'react'

export default function useReveal(){
  const ref = useRef<HTMLElement|null>(null)
  useEffect(()=>{
    const el = ref.current
    if(!el) return
    const obs = new IntersectionObserver(entries =>{
      entries.forEach(e=>{
        if(e.isIntersecting) e.target.classList.add('show')
      })
    }, { threshold: 0.1 })
    obs.observe(el)
    return ()=> obs.disconnect()
  }, [])
  return ref
}
