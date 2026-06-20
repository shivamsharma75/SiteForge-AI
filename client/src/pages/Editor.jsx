import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { useState } from 'react'
import { ArrowLeft, Check, Code2, MessageSquare, Monitor, Rocket, Save, Send, X, Palette, Download, ChevronDown, Sparkles, Layers, Inbox } from 'lucide-react'
import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import Editor from '@monaco-editor/react';
import { themes, colorPalettes, fonts, animationPresets } from '../config/designTokens'

import ChatMessages from '../components/ChatMessages'
import ChatInput from '../components/ChatInput'
import DesignPanel from '../components/DesignPanel'
import SectionsPanel from '../components/SectionsPanel'

const injectSiteForgeScript = (html, id, slug) => {
    if (!html) return html;
    const script = `
        <script>
          window.SiteForge = {
            backendUrl: "${serverUrl}",
            websiteId: "${id}",
            slug: "${slug || ''}"
          };
        </script>
    `;
    const headEnd = html.toLowerCase().indexOf('</head>');
    if (headEnd !== -1) {
        return html.substring(0, headEnd) + script + html.substring(headEnd);
    }
    return html + script;
}

function WebsiteEditor() {

    const { id } = useParams()
    const navigate = useNavigate()
    const [website, setWebsite] = useState(null)
    const [error, setError] = useState("")
    const [code, setCode] = useState("")
    const [messages, setMessages] = useState([])
    const [prompt, setPrompt] = useState("")
    const iframeRef = useRef(null)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [thinkingIndex, setThinkingIndex] = useState(0)
    const [showCode, setShowCode] = useState(false)
    const [showFullPreview, setShowFullPreview] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [submissions, setSubmissions] = useState([])
    const [submissionsLoading, setSubmissionsLoading] = useState(false)
    const [expandedSubmission, setExpandedSubmission] = useState(null)

    // Design settings state
    const [activeTab, setActiveTab] = useState("chat") // "chat" | "design" | "sections"
    const [designLoading, setDesignLoading] = useState(false)
    const [enhancingPrompt, setEnhancingPrompt] = useState(false)
    const [sectionLoading, setSectionLoading] = useState(null)
    const [deployLoading, setDeployLoading] = useState(false)
    const [settings, setSettings] = useState({
        theme: 'dark',
        colorPalette: 'professional-blue',
        customColor: '',
        font: 'inter',
        animationPreset: 'fade-in',
        seoTitle: '',
        seoDescription: ''
    })
    const debounceTimeout = useRef(null)

    // Save code state
    const [saveLoading, setSaveLoading] = useState(false)
    const [saveStatus, setSaveStatus] = useState(null) // null | 'saved' | 'error'

    // Chat scroll refs
    const desktopChatEndRef = useRef(null)
    const mobileChatEndRef = useRef(null)

    const thinkingSteps = [
        "Understanding your request…",
        "Planning layout changes…",
        "Improving responsiveness…",
        "Applying animations…",
        "Finalizing update…",
    ]

    const handleUpdate = async () => {
        if (!prompt) return
        setUpdateLoading(true)
        const text = prompt
        setPrompt("")
        setMessages((m) => [...m, { role: "user", content: prompt }])
        try {
            const result = await axios.post(`${serverUrl}/api/website/update/${id}`, { prompt: text }, { withCredentials: true })
            setUpdateLoading(false)
            setMessages((m) => [...m, { role: "ai", content: result.data.message }])
            setCode(result.data.code)
        } catch (error) {
            setUpdateLoading(false)
            const errMsg = error?.response?.data?.message || "Something went wrong. Please try again."
            setMessages((m) => [...m, { role: "ai", content: `⚠️ ${errMsg}` }])
            console.log(error)
        }
    }

    const handleDeploy = async () => {
        if (deployLoading) return
        setDeployLoading(true)
        try {
            const result = await axios.get(`${serverUrl}/api/website/deploy/${website._id}`, { withCredentials: true })
            window.open(`${result.data.url}`, "_blank")
        } catch (error) {
            console.log(error)
        } finally {
            setDeployLoading(false)
        }
    }

    const handleEnhance = async () => {
        if (!prompt.trim() || enhancingPrompt) return
        setEnhancingPrompt(true)
        try {
            const result = await axios.post(`${serverUrl}/api/website/enhance-prompt`, { prompt }, { withCredentials: true })
            if (result.data && result.data.enhancedPrompt) {
                setPrompt(result.data.enhancedPrompt)
            }
        } catch (err) {
            console.error("Enhance prompt error:", err)
        } finally {
            setEnhancingPrompt(false)
        }
    }

    const handleAddSection = async (sectionId, sectionPrompt) => {
        if (sectionLoading || updateLoading) return
        setSectionLoading(sectionId)
        setUpdateLoading(true)
        setMessages((m) => [...m, { role: "user", content: `Add ${sectionId} section.` }])
        try {
            const result = await axios.post(`${serverUrl}/api/website/update/${id}`, { prompt: sectionPrompt }, { withCredentials: true })
            setMessages((m) => [...m, { role: "ai", content: result.data.message }])
            setCode(result.data.code)
        } catch (error) {
            const errMsg = error?.response?.data?.message || "Failed to add section. Please try again."
            setMessages((m) => [...m, { role: "ai", content: `⚠️ ${errMsg}` }])
            console.error("Section add error:", error)
        } finally {
            setSectionLoading(null)
            setUpdateLoading(false)
        }
    }

    const handleSaveCode = async () => {
        if (!code || saveLoading) return
        setSaveLoading(true)
        setSaveStatus(null)
        try {
            await axios.patch(`${serverUrl}/api/website/save-code/${id}`, { code }, { withCredentials: true })
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus(null), 2500)
        } catch (error) {
            setSaveStatus('error')
            setTimeout(() => setSaveStatus(null), 2500)
            console.log(error)
        } finally {
            setSaveLoading(false)
        }
    }

    const handleDownloadCode = () => {
        if (!code) return
        const blob = new Blob([code], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${website?.title || 'website'}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const updateSettingsAPI = async (newSettings) => {
        setDesignLoading(true)
        try {
            const res = await axios.patch(
                `${serverUrl}/api/website/design-settings/${id}`,
                { designSettings: newSettings },
                { withCredentials: true }
            )
            setCode(res.data.latestCode)
            setWebsite(res.data)
        } catch (err) {
            console.error("Failed to update design settings:", err)
        } finally {
            setDesignLoading(false)
        }
    }

    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value }

        if (key === 'colorPalette') {
            newSettings.customColor = null
        }

        setSettings(newSettings)

        if (key === 'customColor') {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
            debounceTimeout.current = setTimeout(() => {
                updateSettingsAPI(newSettings)
            }, 300)
        } else {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
            updateSettingsAPI(newSettings)
        }
    }

    const fetchSubmissions = async () => {
        setSubmissionsLoading(true)
        try {
            const res = await axios.get(`${serverUrl}/api/website/submissions/${id}`, { withCredentials: true })
            setSubmissions(res.data)
        } catch (err) {
            console.error("Failed to fetch submissions:", err)
        } finally {
            setSubmissionsLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'leads') {
            fetchSubmissions()
        }
    }, [activeTab])

    // Rotate thinking steps while updating
    useEffect(() => {
        if (!updateLoading) return;
        const i = setInterval(() => {
            setThinkingIndex((i) => (i + 1) % thinkingSteps.length)
        }, 1200)
        return () => clearInterval(i)
    }, [updateLoading])

    // Fetch website on mount
    useEffect(() => {
        const handleGetWebsite = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/website/get-by-id/${id}`, { withCredentials: true })
                setWebsite(result.data)
                setCode(result.data.latestCode)
                setMessages(result.data.conversation)
                if (result.data.designSettings) {
                    setSettings({
                        theme: result.data.designSettings.theme || 'dark',
                        colorPalette: result.data.designSettings.colorPalette || 'professional-blue',
                        customColor: result.data.designSettings.customColor || '',
                        font: result.data.designSettings.font || 'inter',
                        animationPreset: result.data.designSettings.animationPreset || 'fade-in',
                        seoTitle: result.data.designSettings.seoTitle || '',
                        seoDescription: result.data.designSettings.seoDescription || ''
                    })
                }
            } catch (error) {
                console.log(error)
                setError(error?.response?.data?.message || "Failed to load website")
            }
        }
        handleGetWebsite()
    }, [id])

    // Update iframe preview when code changes
    useEffect(() => {
        if (!iframeRef.current || !code) return;
        const injectedHtml = injectSiteForgeScript(code, id, website?.slug)
        const blob = new Blob([injectedHtml], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        iframeRef.current.src = url
        return () => URL.revokeObjectURL(url)
    }, [code, website, id])

    // Auto-scroll desktop chat to bottom on new messages
    useEffect(() => {
        if (desktopChatEndRef.current) {
            desktopChatEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, updateLoading])

    // Auto-scroll mobile chat to bottom on new messages
    useEffect(() => {
        if (mobileChatEndRef.current && showChat) {
            mobileChatEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, updateLoading, showChat])

    if (error) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-red-400'>
                {error}
            </div>
        )
    }
    if (!website) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-white'>
                Loading...
            </div>
        )
    }



    return (
        <div className='h-screen w-screen flex bg-[#040404] text-white overflow-hidden'>
            {/* Desktop Sidebar */}
            <aside className='hidden lg:flex w-95 flex-col border-r border-white/[0.07] bg-[#090909]/60 backdrop-blur-xl'>
                <Header />

                {/* Tab Switcher */}
                <div className="px-4 py-2 border-b border-white/[0.07] flex gap-1 bg-black/20">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'chat'
                                ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                            }`}
                    >
                        <MessageSquare size={13} />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('design')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'design'
                                ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                            }`}
                    >
                        <Palette size={13} />
                        Design
                    </button>
                    <button
                        onClick={() => setActiveTab('sections')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'sections'
                                ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                            }`}
                    >
                        <Layers size={13} />
                        Sections
                    </button>
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'leads'
                                ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                            }`}
                    >
                        <Inbox size={13} />
                        Leads
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative flex flex-col">
                    <AnimatePresence mode="wait">
                        {activeTab === 'chat' ? (
                            <motion.div
                                key="chat-panel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: 'easeInOut' }}
                                className="flex-1 flex flex-col overflow-hidden"
                            >
                                <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                                    <ChatMessages
                                        messages={messages}
                                        updateLoading={updateLoading}
                                        thinkingIndex={thinkingIndex}
                                        thinkingSteps={thinkingSteps}
                                        endRef={desktopChatEndRef}
                                    />
                                </div>
                                <ChatInput
                                    prompt={prompt}
                                    setPrompt={setPrompt}
                                    updateLoading={updateLoading}
                                    enhancingPrompt={enhancingPrompt}
                                    handleUpdate={handleUpdate}
                                    handleEnhance={handleEnhance}
                                />
                            </motion.div>
                        ) : activeTab === 'design' ? (
                            <motion.div
                                key="design-panel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: 'easeInOut' }}
                                className='flex-1 overflow-y-auto px-4 py-4'
                            >
                                <DesignPanel
                                    settings={settings}
                                    handleSettingChange={handleSettingChange}
                                    updateSettingsAPI={updateSettingsAPI}
                                    setSettings={setSettings}
                                />
                            </motion.div>
                        ) : activeTab === 'sections' ? (
                            <motion.div
                                key="sections-panel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: 'easeInOut' }}
                                className='flex-1 overflow-y-auto px-4 py-4'
                            >
                                <SectionsPanel
                                    onAddSection={handleAddSection}
                                    sectionLoading={sectionLoading}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="leads-panel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: 'easeInOut' }}
                                className='flex-1 overflow-y-auto px-4 py-4 flex flex-col'
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-zinc-300">Form Submissions</h3>
                                    <button 
                                        onClick={fetchSubmissions} 
                                        disabled={submissionsLoading}
                                        className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-zinc-400 hover:text-white transition cursor-pointer disabled:opacity-50"
                                    >
                                        {submissionsLoading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                                {submissionsLoading && submissions.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center py-10 text-zinc-500 text-xs">
                                        Loading submissions...
                                    </div>
                                ) : submissions.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                                        <Inbox size={24} className="text-zinc-600 mb-2" />
                                        <p className="text-xs text-zinc-400 font-medium">No leads yet</p>
                                        <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1">Submissions from forms generated on your site will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pb-8">
                                        {submissions.map((sub) => {
                                            const isExpanded = expandedSubmission === sub._id;
                                            const formattedDate = new Date(sub.createdAt).toLocaleString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            });
                                            return (
                                                <div 
                                                    key={sub._id} 
                                                    className={`border rounded-xl transition-all duration-200 ${isExpanded ? 'bg-white/[0.04] border-white/15' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.03]'}`}
                                                >
                                                    <div 
                                                        onClick={() => setExpandedSubmission(isExpanded ? null : sub._id)}
                                                        className="px-4 py-3 flex justify-between items-center cursor-pointer select-none"
                                                    >
                                                        <div className="min-w-0 pr-2">
                                                            <div className="text-xs font-semibold text-zinc-200 truncate">{sub.formName}</div>
                                                            <div className="text-[10px] text-zinc-500 mt-0.5">{formattedDate}</div>
                                                        </div>
                                                        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] bg-black/10 rounded-b-xl space-y-2">
                                                            {Object.entries(sub.data || {}).map(([key, val]) => (
                                                                <div key={key} className="text-xs">
                                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{key}</div>
                                                                    <div className="text-zinc-300 mt-0.5 break-words whitespace-pre-wrap">{val || <span className="italic text-zinc-600">empty</span>}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </aside>

            {/* Main Preview Area */}
            <div className='flex-1 flex flex-col bg-[#040404] relative'>
                <div className='h-14 px-4 flex justify-between items-center border-b border-white/[0.07] bg-[#090909]/80 backdrop-blur-md z-10'>
                    <div className='flex items-center gap-2'>
                        <span className='text-xs font-semibold text-zinc-400'>Live Preview</span>
                        {designLoading && (
                            <div className="w-3.5 h-3.5 border-2 border-violet-400/20 border-t-violet-400 rounded-full animate-spin shrink-0" />
                        )}
                    </div>
                    <div className='flex gap-2 items-center'>
                        {!website.deployed && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                disabled={deployLoading}
                                className='flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-md shadow-violet-950/20 hover:opacity-90 transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed font-medium'
                                onClick={handleDeploy}
                            >
                                {deployLoading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
                                        Deploying…
                                    </>
                                ) : (
                                    <>
                                        <Rocket size={14} /> Deploy
                                    </>
                                )}
                            </motion.button>
                        )}
                        <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            className='p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer lg:hidden' 
                            onClick={() => setShowChat(true)}
                        >
                            <MessageSquare size={16} />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            className='p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer' 
                            onClick={() => setShowCode(true)}
                        >
                            <Code2 size={16} />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            className='p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer' 
                            onClick={() => setShowFullPreview(true)}
                        >
                            <Monitor size={16} />
                        </motion.button>
                    </div>
                </div>

                {/* Pulsing loading progress bar */}
                {(updateLoading || designLoading || sectionLoading) && (
                    <div className="absolute top-14 left-0 right-0 h-0.5 overflow-hidden bg-white/5 z-20">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "linear"
                            }}
                            className="h-full w-1/3 bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                        />
                    </div>
                )}

                <iframe ref={iframeRef} sandbox='allow-scripts allow-same-origin allow-forms' className='flex-1 w-full bg-white border-0' />
            </div>

            {/* Mobile Chat Overlay */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="fixed inset-0 z-[9999] bg-[#040404] flex flex-col"
                    >
                        <Header onclose={() => setShowChat(false)} />

                        {/* Tab Switcher */}
                        <div className="px-4 py-2 border-b border-white/[0.07] flex gap-1 bg-black/20">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'chat'
                                        ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                                    }`}
                            >
                                <MessageSquare size={13} />
                                Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('design')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'design'
                                        ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                                    }`}
                            >
                                <Palette size={13} />
                                Design
                            </button>
                            <button
                                onClick={() => setActiveTab('sections')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'sections'
                                        ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                                    }`}
                            >
                                <Layers size={13} />
                                Sections
                            </button>
                            <button
                                onClick={() => setActiveTab('leads')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'leads'
                                        ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                                    }`}
                            >
                                <Inbox size={13} />
                                Leads
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            <AnimatePresence mode="wait">
                                {activeTab === 'chat' ? (
                                    <motion.div
                                        key="mobile-chat-panel"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                                        className="flex-1 flex flex-col overflow-hidden"
                                    >
                                        <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                                            <ChatMessages
                                                messages={messages}
                                                updateLoading={updateLoading}
                                                thinkingIndex={thinkingIndex}
                                                thinkingSteps={thinkingSteps}
                                                endRef={mobileChatEndRef}
                                            />
                                        </div>
                                        <ChatInput
                                            prompt={prompt}
                                            setPrompt={setPrompt}
                                            updateLoading={updateLoading}
                                            enhancingPrompt={enhancingPrompt}
                                            handleUpdate={handleUpdate}
                                            handleEnhance={handleEnhance}
                                        />
                                    </motion.div>
                                ) : activeTab === 'design' ? (
                                    <motion.div
                                        key="mobile-design-panel"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                                        className='flex-1 overflow-y-auto px-4 py-4'
                                    >
                                        <DesignPanel
                                            settings={settings}
                                            handleSettingChange={handleSettingChange}
                                            updateSettingsAPI={updateSettingsAPI}
                                            setSettings={setSettings}
                                        />
                                    </motion.div>
                                ) : activeTab === 'sections' ? (
                                    <motion.div
                                        key="mobile-sections-panel"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                                        className='flex-1 overflow-y-auto px-4 py-4'
                                    >
                                        <SectionsPanel
                                            onAddSection={handleAddSection}
                                            sectionLoading={sectionLoading}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="mobile-leads-panel"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                                        className='flex-1 overflow-y-auto px-4 py-4 flex flex-col'
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-semibold text-zinc-300">Form Submissions</h3>
                                            <button 
                                                onClick={fetchSubmissions} 
                                                disabled={submissionsLoading}
                                                className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-zinc-400 hover:text-white transition cursor-pointer disabled:opacity-50"
                                            >
                                                {submissionsLoading ? 'Refreshing...' : 'Refresh'}
                                            </button>
                                        </div>
                                        {submissionsLoading && submissions.length === 0 ? (
                                            <div className="flex-1 flex items-center justify-center py-10 text-zinc-500 text-xs">
                                                Loading submissions...
                                            </div>
                                        ) : submissions.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                                                <Inbox size={24} className="text-zinc-600 mb-2" />
                                                <p className="text-xs text-zinc-400 font-medium">No leads yet</p>
                                                <p className="text-[10px] text-zinc-500 max-w-[200px] mt-1">Submissions from forms generated on your site will appear here.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 pb-8">
                                                {submissions.map((sub) => {
                                                    const isExpanded = expandedSubmission === sub._id;
                                                    const formattedDate = new Date(sub.createdAt).toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    });
                                                    return (
                                                        <div 
                                                            key={sub._id} 
                                                            className={`border rounded-xl transition-all duration-200 ${isExpanded ? 'bg-white/[0.04] border-white/15' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.03]'}`}
                                                        >
                                                            <div 
                                                                onClick={() => setExpandedSubmission(isExpanded ? null : sub._id)}
                                                                className="px-4 py-3 flex justify-between items-center cursor-pointer select-none"
                                                            >
                                                                <div className="min-w-0 pr-2">
                                                                    <div className="text-xs font-semibold text-zinc-200 truncate">{sub.formName}</div>
                                                                    <div className="text-[10px] text-zinc-500 mt-0.5">{formattedDate}</div>
                                                                </div>
                                                                <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] bg-black/10 rounded-b-xl space-y-2">
                                                                    {Object.entries(sub.data || {}).map(([key, val]) => (
                                                                        <div key={key} className="text-xs">
                                                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{key}</div>
                                                                            <div className="text-zinc-300 mt-0.5 break-words">{val || <span className="italic text-zinc-600">empty</span>}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Code Editor Overlay */}
            <AnimatePresence>
                {showCode && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        className="fixed inset-y-0 right-0 w-full lg:w-[45%] z-[9999] bg-[#121212] border-l border-white/[0.07] flex flex-col shadow-2xl"
                    >
                        <div className='h-14 px-4 flex justify-between items-center border-b border-white/[0.07] bg-[#161616]'>
                            <span className='text-sm font-medium text-zinc-300'>index.html</span>
                            <div className='flex items-center gap-2'>
                                {/* Save Code Button */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSaveCode}
                                    disabled={saveLoading}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${saveStatus === 'saved'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/20'
                                            : saveStatus === 'error'
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 cursor-pointer'
                                        } disabled:opacity-60`}
                                >
                                    {saveStatus === 'saved' ? (
                                        <><Check size={12} /> Saved</>
                                    ) : saveStatus === 'error' ? (
                                        <>⚠ Error</>
                                    ) : saveLoading ? (
                                        <>Saving…</>
                                    ) : (
                                        <><Save size={12} /> Save Code</>
                                    )}
                                </motion.button>

                                {/* Download Code Button */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDownloadCode}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white border border-violet-500/20 cursor-pointer transition-all duration-200"
                                >
                                    <Download size={12} /> Download Code
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowCode(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
                                >
                                    <X size={16} />
                                </motion.button>
                            </div>
                        </div>
                        <Editor
                            theme='vs-dark'
                            value={code}
                            language='html'
                            onChange={(v) => setCode(v)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full Preview Overlay */}
            <AnimatePresence>
                {showFullPreview && (
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-[#040404]"
                    >
                        <iframe className='w-full h-full bg-white border-0' srcDoc={code} sandbox='allow-scripts allow-same-origin allow-forms' />
                        <button onClick={() => setShowFullPreview(false)} className='absolute top-4 right-4 p-2 bg-black/70 hover:bg-black/90 border border-white/10 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer'>
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )

    function Header({ onclose }) {
        return (
            <div className='h-14 px-4 flex items-center justify-between border-b border-white/[0.07] bg-[#090909]/40 gap-3'>
                <div className="flex items-center gap-2.5 min-w-0">
                    {!onclose && (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className='p-1.5 rounded-lg hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer text-zinc-400 hover:text-white shrink-0'
                        >
                            <ArrowLeft size={14} />
                        </button>
                    )}
                    <span className='font-semibold text-sm truncate text-zinc-200'>{website.title}</span>
                </div>
                {onclose && (
                    <button
                        onClick={onclose}
                        className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer text-zinc-400 hover:text-white shrink-0 transition"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        )
    }
}

export default WebsiteEditor
