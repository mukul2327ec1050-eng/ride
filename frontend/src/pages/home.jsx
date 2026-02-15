import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import * as THREE from 'three'

export default function Index() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const logoRef = useRef(null)
  const headingRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const arrowRef = useRef(null)
  const bottomRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    // ===== GSAP INTRO =====
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(logoRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8 })
        .fromTo(headingRef.current, { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 1 }, '-=0.4')
        .fromTo(subRef.current, { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.8 }, '-=0.7')
        .fromTo(bottomRef.current, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1 }, '-=0.5')

      gsap.to(ctaRef.current, { y: -8, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    }, containerRef)

    // ===== THREE BACKGROUND =====
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const starCount = 1500
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(starCount * 3)
    const speeds = new Float32Array(starCount)

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 10
      positions[i3 + 1] = (Math.random() - 0.5) * 10
      positions[i3 + 2] = -Math.random() * 20
      speeds[i] = 0.02 + Math.random() * 0.05
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.9 })
    const stars = new THREE.Points(geometry, material)
    scene.add(stars)

    const animate = () => {
      const pos = geometry.attributes.position.array
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3
        pos[i3 + 2] += speeds[i]
        if (pos[i3 + 2] > 2) pos[i3 + 2] = -20
      }
      geometry.attributes.position.needsUpdate = true
      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', resize)

    return () => {
      ctx.revert()
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  // arrow hover animation
  const handleHover = () => {
    gsap.to(arrowRef.current, { x: 8, duration: 0.25, ease: 'power2.out' })
  }

  const handleLeave = () => {
    gsap.to(arrowRef.current, { x: 0, duration: 0.25, ease: 'power2.out' })
  }

  const goLogin = () => {
    gsap.to(containerRef.current, { scale: 1.05, opacity: 0, duration: 0.6, onComplete: () => navigate('/login') })
  }

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />

      <div className="relative z-10 flex h-full flex-col justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-[2px] bg-white/70"></div>
          <div ref={logoRef} className="text-2xl font-extrabold tracking-wide opacity-0">AaoChale</div>
        </div>

        <div className="flex flex-col items-center text-center -mt-16">
          <h1 ref={headingRef} className="text-4xl font-black tracking-tight opacity-0 leading-none">
            Move the way<br/><span className="text-gray-300">you want</span>
          </h1>
          <p ref={subRef} className="mt-4 text-base text-gray-300 opacity-0">Request a ride, hop in, and go.</p>
        </div>

        <div ref={bottomRef} className="opacity-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 w-full">
            <h2 className="text-xl font-bold mb-1">Get Started with AaoChale</h2>
            <p className="text-gray-300 text-xs mb-4">Your ride is just a tap away</p>

            <div ref={ctaRef}>
              <button
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
                onClick={goLogin}
                className="w-full bg-white text-black py-3 rounded-xl text-lg font-semibold flex items-center justify-center gap-2"
              >
                Continue
                <span ref={arrowRef}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
