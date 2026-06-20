import React, { useState } from 'react'
import { Check, X, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { themes, colorPalettes, fonts, animationPresets } from '../config/designTokens'

const DesignPanel = ({ settings, handleSettingChange, updateSettingsAPI, setSettings }) => {
    const [isSeoOpen, setIsSeoOpen] = useState(false)
    return (
        <div className="space-y-6 text-zinc-300 pb-8">
            {/* Theme Selector */}
            <div className="space-y-3">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Theme</label>
                <div className="grid grid-cols-2 gap-2.5">
                    {themes.map((t) => {
                        const isSelected = settings.theme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => handleSettingChange('theme', t.id)}
                                className={`relative overflow-hidden rounded-xl p-2.5 text-left transition-all duration-200 border cursor-pointer ${isSelected
                                        ? 'border-violet-500 ring-2 ring-violet-500/20 bg-white/5'
                                        : 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'
                                    }`}
                            >
                                <div
                                    className="h-10 w-full rounded-lg mb-2 flex items-center justify-center relative border border-white/5 shadow-inner"
                                    style={{
                                        backgroundColor: t.previewBg
                                    }}
                                >
                                    <div className="flex gap-1.5 items-center">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.previewPrimary }} />
                                        <span className="text-[10px] font-bold" style={{ color: t.previewText }}>Aa</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-zinc-300">{t.name}</span>
                                    {isSelected && <Check size={12} className="text-violet-400" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Color Palette Selector */}
            <div className="space-y-3">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Color Palette</label>
                <div className="space-y-2">
                    {colorPalettes.map((p) => {
                        const isSelected = settings.colorPalette === p.id && !settings.customColor;
                        return (
                            <button
                                key={p.id}
                                onClick={() => handleSettingChange('colorPalette', p.id)}
                                className={`w-full rounded-xl p-3 text-left transition-all duration-200 border flex items-center justify-between cursor-pointer ${isSelected
                                        ? 'border-violet-500 bg-white/5'
                                        : 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'
                                    }`}
                            >
                                <span className="text-xs font-medium text-zinc-300">{p.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-1">
                                        <div className="w-3.5 h-3.5 rounded-full border border-[#090909]" style={{ backgroundColor: p.primary }} />
                                        <div className="w-3.5 h-3.5 rounded-full border border-[#090909]" style={{ backgroundColor: p.secondary }} />
                                        <div className="w-3.5 h-3.5 rounded-full border border-[#090909]" style={{ backgroundColor: p.accent }} />
                                    </div>
                                    {isSelected && <Check size={11} className="text-violet-400" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Custom Hex Color Picker */}
                <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-medium text-zinc-500">Custom Primary Color Override</span>
                    <div className="flex items-center gap-2">
                        <div className="relative shrink-0 w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center bg-black/40 overflow-hidden group">
                            <input
                                type="color"
                                value={settings.customColor || '#2563eb'}
                                onChange={(e) => handleSettingChange('customColor', e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div
                                className="w-5.5 h-5.5 rounded-lg shadow-md border border-white/10"
                                style={{ backgroundColor: settings.customColor || '#2563eb' }}
                            />
                        </div>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">#</span>
                            <input
                                type="text"
                                placeholder="2563eb"
                                value={(settings.customColor || '').replace('#', '')}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        handleSettingChange('customColor', '')
                                    } else if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                                        handleSettingChange('customColor', '#' + val)
                                    }
                                }}
                                className="w-full rounded-xl pl-6 pr-3 py-2 bg-black/40 border border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-xs font-mono text-zinc-200 outline-none transition-all"
                            />
                        </div>
                        {settings.customColor && (
                            <button
                                onClick={() => handleSettingChange('colorPalette', settings.colorPalette || 'professional-blue')}
                                className="p-2 rounded-xl hover:bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                                title="Reset custom color"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Font Selector */}
            <div className="space-y-2">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Typography</label>
                <div className="relative">
                    <select
                        value={settings.font}
                        onChange={(e) => handleSettingChange('font', e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 bg-black/40 border border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-xs text-zinc-300 outline-none cursor-pointer appearance-none transition-all"
                    >
                        {fonts.map((f) => (
                            <option
                                key={f.id}
                                value={f.id}
                                style={{ fontFamily: f.family }}
                                className="bg-[#121212] text-zinc-300 py-2 text-sm"
                            >
                                {f.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
                </div>
            </div>

            {/* Animation Selector */}
            <div className="space-y-2">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Animations Preset</label>
                <div className="relative">
                    <select
                        value={settings.animationPreset}
                        onChange={(e) => handleSettingChange('animationPreset', e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 bg-black/40 border border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-xs text-zinc-300 outline-none cursor-pointer appearance-none transition-all"
                    >
                        {animationPresets.map((a) => (
                            <option key={a.id} value={a.id} className="bg-[#121212] text-zinc-300 py-2 text-sm">
                                {a.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
                </div>
            </div>

            {/* SEO Settings Collapsible Section */}
            <div className="border-t border-white/[0.08] pt-5">
                <button
                    onClick={() => setIsSeoOpen(!isSeoOpen)}
                    className="w-full flex items-center justify-between text-left cursor-pointer group py-1"
                >
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-200 transition-colors cursor-pointer">
                        SEO Settings
                    </label>
                    <ChevronDown
                        size={14}
                        className={`text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${isSeoOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                <AnimatePresence initial={false}>
                    {isSeoOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-4 pt-4">
                                {/* SEO Title Input */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-zinc-400">SEO Title</span>
                                        <span className="text-[10px] text-zinc-500">{settings.seoTitle?.length || 0} / 60</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter search title..."
                                        maxLength={60}
                                        value={settings.seoTitle || ''}
                                        onChange={(e) => handleSettingChange('seoTitle', e.target.value)}
                                        className="w-full rounded-xl px-3.5 py-2.5 bg-black/40 border border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-xs text-zinc-200 outline-none transition-all placeholder-zinc-600"
                                    />
                                </div>

                                {/* SEO Description Input */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-zinc-400">SEO Description</span>
                                        <span className="text-[10px] text-zinc-500">{settings.seoDescription?.length || 0} / 160</span>
                                    </div>
                                    <textarea
                                        placeholder="Enter search description..."
                                        maxLength={160}
                                        rows={3}
                                        value={settings.seoDescription || ''}
                                        onChange={(e) => handleSettingChange('seoDescription', e.target.value)}
                                        className="w-full rounded-xl px-3.5 py-2.5 bg-black/40 border border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-xs text-zinc-200 outline-none transition-all placeholder-zinc-600 resize-none"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Reset to Default Button */}
            <button
                onClick={() => {
                    const defaults = {
                        theme: 'dark',
                        colorPalette: 'professional-blue',
                        customColor: '',
                        font: 'inter',
                        animationPreset: 'fade-in',
                        seoTitle: '',
                        seoDescription: ''
                    }
                    setSettings(defaults)
                    updateSettingsAPI(defaults)
                }}
                className="w-full mt-4 py-2.5 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-xs font-semibold text-zinc-400 hover:text-red-400 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
                Reset to Default
            </button>
        </div>
    )
}

export default DesignPanel
