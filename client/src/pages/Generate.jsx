import { ArrowLeft, Sparkles } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import axios from "axios"
import { serverUrl } from '../App'

const PHASES = [
    "Analyzing your idea…",
    "Designing layout & structure…",
    "Writing HTML & CSS…",
    "Adding animations & interactions…",
    "Final quality checks…",
];
function Generate() {
    const navigate = useNavigate()
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [phaseIndex, setPhaseIndex] = useState(0)
    const [error,setError]=useState("")

    const [enhancing, setEnhancing] = useState(false)
    const [enhancedPrompt, setEnhancedPrompt] = useState("")
    const [showEnhancementModal, setShowEnhancementModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const enhancedTextAreaRef = useRef(null)

    const executeGeneration = async (finalPrompt) => {
        setLoading(true)
        setError("")
        try {
            const result = await axios.post(`${serverUrl}/api/website/generate`, { prompt: finalPrompt }, { withCredentials: true })
            console.log(result)
            setProgress(100)
            setLoading(false)
            navigate(`/editor/${result.data.websiteId}`)
        } catch (error) {
            setLoading(false)
            setError(error.response?.data?.message || "something went wrong")
            console.log(error)
        }
    }

    const handleStartFlow = async () => {
        if (!prompt.trim()) return
        setEnhancing(true)
        setError("")
        try {
            const result = await axios.post(`${serverUrl}/api/website/enhance-prompt`, { prompt }, { withCredentials: true })
            if (result.data && result.data.enhanced !== false && result.data.enhancedPrompt) {
                setEnhancedPrompt(result.data.enhancedPrompt)
                setIsEditing(false)
                setShowEnhancementModal(true)
            } else {
                await executeGeneration(prompt)
            }
        } catch (err) {
            console.log("Prompt enhancement failed, proceeding with original prompt:", err)
            await executeGeneration(prompt)
        } finally {
            setEnhancing(false)
        }
    }

    useEffect(() => {
        if (!loading) {
            setPhaseIndex(0)
            setProgress(0)
            return
        }

        let value = 0
        let phase = 0

        const interval = setInterval(() => {
            const increment = value < 20
                ? Math.random() * 1.5
                : value < 60
                    ? Math.random() * 1.2
                    : Math.random() * 0.6;
            value += increment

            if (value >= 93) value = 93;

            phase = Math.min(
                Math.floor((value / 100) * PHASES.length), PHASES.length - 1
            )

            setProgress(Math.floor(value))
            setPhaseIndex(phase)

        }, 1200)

        return () => clearInterval(interval)
    }, [loading])

    return (
        <div className='min-h-screen bg-linear-to-br from-[#050505] via-[#0b0b0b] to-[#050505] text-white'>
            <div className='sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10'>
                <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button className='p-2 rounded-lg hover:bg-white/10 transition' onClick={() => navigate("/")}><ArrowLeft size={16} /></button>
                        <h1 className='text-lg font-semibold'>SiteForge<span className='text-zinc-400'> AI</span></h1>
                    </div>

                </div>
            </div>

            <div className='max-w-6xl mx-auto px-6 py-16'>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className='text-4xl md:text-5xl font-bold mb-5 leading-tight'>
                        Build Websites with
                        <span className='block bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent'>Real AI Power</span>
                    </h1>
                    <p className='text-zinc-400 max-w-2xl mx-auto'>
                        This process may take several minutes.
                        SiteForge AI focuses on quality, not shortcuts.
                    </p>

                </motion.div>
                <div className='mb-14'>
                    <h1 className='text-xl font-semibold mb-2'>Describe your website</h1>
                    <div className='relative'>
                        <textarea
                            onChange={(e) => setPrompt(e.target.value)}
                            value={prompt}
                            disabled={loading || enhancing}
                            placeholder='Describe your website in detail...'
                            className={`w-full h-56 p-6 rounded-3xl bg-black/60 border border-white/10 outline-none resize-none text-sm leading-relaxed focus:ring-2 focus:ring-white/20 transition-all ${
                                loading || enhancing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}></textarea>
                    </div>
                    

                    {error && <p className='mt-4 text-sm text-red-400'>{error}</p>}

                </div>
                <div className='flex flex-col items-center justify-center gap-4'>
                    <motion.button
                        whileHover={prompt.trim() && !loading && !enhancing ? { scale: 1.05 } : {}}
                        whileTap={prompt.trim() && !loading && !enhancing ? { scale: 0.96 } : {}}
                        onClick={handleStartFlow}
                        disabled={!prompt.trim() || loading || enhancing}
                        className={`px-14 py-4 rounded-2xl font-semibold text-lg transition-all ${
                            prompt.trim() && !loading && !enhancing
                                ? "bg-white text-black cursor-pointer hover:bg-zinc-200"
                                : "bg-white/20 text-zinc-400 cursor-not-allowed"
                        }`}
                    >
                        Generate Website
                    </motion.button>

                    {enhancing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-zinc-400 flex items-center justify-center gap-2 mt-2"
                        >
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Enhancing your prompt...
                        </motion.div>
                    )}
                </div>


                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-xl mx-auto mt-12"
                    >
                        <div className='flex justify-between mb-2 text-xs text-zinc-400'>
                            <span >{PHASES[phaseIndex]}</span>
                            <span >{progress}%</span>
                        </div>

                        <div className='h-2 w-full bg-white/10 rounded-full overflow-hidden'>
                            <motion.div
                                className="h-full bg-linear-to-r from-white to-zinc-300"
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "easeOut", duration: 0.8 }}
                            />
                        </div>

                        <div className='text-center text-xs text-zinc-400 mt-4'>
                            Estimated time remaining:{" "}
                            <span className="text-white font-medium">
                                ~8–12 minutes
                            </span>
                        </div>

                    </motion.div>
                )}


            </div>

            {showEnhancementModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl backdrop-blur-xl"
                    >
                        <h2 className="text-xl font-bold mb-2">Enhance Your Prompt</h2>
                        <p className="text-xs text-zinc-400 mb-6">
                            We've added structure, layout, style, and section details to improve the AI generation quality. You can use it as-is, edit it, or use your original prompt.
                        </p>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-zinc-400">Prompt Preview</span>
                                <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/25">
                                    <Sparkles size={11} className="animate-pulse" />
                                    <span>Enhanced by AI</span>
                                </div>
                            </div>
                            <textarea
                                ref={enhancedTextAreaRef}
                                readOnly={!isEditing}
                                value={enhancedPrompt}
                                onChange={(e) => setEnhancedPrompt(e.target.value)}
                                className={`w-full h-40 p-4 rounded-xl border outline-none text-sm leading-relaxed resize-none transition-all ${
                                    isEditing
                                        ? "bg-black/50 border-white/30 text-white focus:ring-1 focus:ring-white/20"
                                        : "bg-black/20 border-white/5 text-zinc-400 cursor-not-allowed"
                                }`}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                            <button
                                onClick={() => {
                                    setShowEnhancementModal(false);
                                    executeGeneration(prompt);
                                }}
                                className="text-sm text-zinc-400 hover:text-white transition order-3 sm:order-1 cursor-pointer"
                            >
                                Use my original instead
                            </button>
                            <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2 justify-end">
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        setTimeout(() => {
                                            enhancedTextAreaRef.current?.focus();
                                        }, 50);
                                    }}
                                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm border transition w-full sm:w-auto ${
                                        isEditing
                                            ? "bg-white/5 border-white/5 text-zinc-500 cursor-not-allowed"
                                            : "bg-white/10 border-white/10 hover:bg-white/15 text-white cursor-pointer"
                                    }`}
                                    disabled={isEditing}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setShowEnhancementModal(false);
                                        executeGeneration(enhancedPrompt);
                                    }}
                                    className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition w-full sm:w-auto cursor-pointer"
                                >
                                    Use this
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default Generate
