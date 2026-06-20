import React from 'react'
import { motion } from 'motion/react'
import { Send, Sparkles } from 'lucide-react'

const ChatInput = ({ prompt, setPrompt, updateLoading, enhancingPrompt, handleUpdate, handleEnhance }) => (
    <div className='p-4 border-t border-white/[0.07] bg-[#090909]/60 backdrop-blur-xl'>
        <div className='flex gap-2 items-center'>
            <div className="relative flex-1">
                <input
                    placeholder='Describe changes…'
                    className='w-full rounded-xl pl-4 pr-10 py-2.5 bg-black/40 border border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all'
                    onChange={(e) => setPrompt(e.target.value)}
                    value={prompt}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !updateLoading && !enhancingPrompt) handleUpdate() }}
                    disabled={updateLoading || enhancingPrompt}
                />
                <motion.button
                    whileHover={{ scale: 1.1, color: '#a78bfa' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEnhance}
                    disabled={updateLoading || enhancingPrompt || !prompt.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    title="Enhance prompt with AI"
                >
                    {enhancingPrompt ? (
                        <div className="w-4 h-4 border-2 border-violet-400/20 border-t-violet-400 rounded-full animate-spin" />
                    ) : (
                        <Sparkles size={16} />
                    )}
                </motion.button>
            </div>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='p-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold transition-all duration-200 flex items-center justify-center shrink-0 disabled:bg-white/10 disabled:text-zinc-500 cursor-pointer disabled:cursor-not-allowed'
                disabled={updateLoading || enhancingPrompt || !prompt.trim()}
                onClick={handleUpdate}
            >
                <Send size={14} />
            </motion.button>
        </div>
    </div>
)

export default ChatInput
