import React from 'react'
import { motion } from 'motion/react'

const ChatMessages = ({ messages, updateLoading, thinkingIndex, thinkingSteps, endRef }) => (
    <>
        {messages.map((m, i) => {
            const isLast = i === messages.length - 1
            return (
                <motion.div
                    key={i}
                    initial={isLast ? { opacity: 0, y: 12 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}
                >
                    <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-violet-950/20"
                            : "bg-white/5 border border-white/[0.08] text-zinc-200 rounded-tl-none"
                            }`}
                    >
                        {m.content}
                    </div>
                </motion.div>
            )
        })}

        {updateLoading && (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className='max-w-[85%] mr-auto'
            >
                <div className='relative overflow-hidden px-4 py-3 rounded-2xl rounded-tl-none text-xs bg-violet-500/5 border border-violet-500/20 text-violet-300 shadow-lg shadow-violet-950/10'>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-indigo-500/5 to-violet-500/5 animate-pulse" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="flex gap-1 items-center shrink-0">
                            {[0, 1, 2].map((dot) => (
                                <motion.span
                                    key={dot}
                                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                                    animate={{
                                        y: [0, -4, 0],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        delay: dot * 0.16,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>
                        <span className="font-medium tracking-wide">{thinkingSteps[thinkingIndex]}</span>
                    </div>
                </div>
            </motion.div>
        )}
        {/* Scroll anchor */}
        <div ref={endRef} />
    </>
)

export default ChatMessages
