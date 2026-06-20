import React from 'react'
import { useMotionValue, useTransform, motion } from 'motion/react'

export function TiltContainer({ children, className = '', maxRotation = 8, enableGlow = false, glowColor = 'rgba(99,102,241,0.12)' }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Map coordinate range [-0.5, 0.5] to rotate values
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxRotation, -maxRotation])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxRotation, maxRotation])

  // Map mouse coordinate relative to element container size
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const relativeX = (e.clientX - rect.left) / width - 0.5
    const relativeY = (e.clientY - rect.top) / height - 0.5
    mouseX.set(relativeX)
    mouseY.set(relativeY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const glowX = useTransform(mouseX, (val) => `${(val + 0.5) * 100}%`)
  const glowY = useTransform(mouseY, (val) => `${(val + 0.5) * 100}%`)
  
  const glowBackground = useTransform([glowX, glowY], ([x, y]) => {
    return `radial-gradient(circle 180px at ${x} ${y}, ${glowColor}, transparent)`
  })

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className={`relative group ${className}`}
    >
      {enableGlow && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: glowBackground
          }}
        />
      )}
      <div style={{ transform: 'translateZ(12px)', transformStyle: 'preserve-3d' }} className="h-full">
        {children}
      </div>
    </motion.div>
  )
}

export default TiltContainer
