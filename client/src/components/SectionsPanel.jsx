import React from 'react'
import { motion } from 'motion/react'

const SectionsPanel = ({ onAddSection, sectionLoading }) => {
    const sectionsList = [
        {
            id: 'hero',
            name: 'Hero Section',
            description: 'Bold title, subtext, CTA buttons, and a clean background layout.',
            prompt: 'Add a high-converting, visually stunning hero section with a bold headline, engaging subtext, primary and secondary CTA buttons, and a clean responsive layout.'
        },
        {
            id: 'features',
            name: 'Features Grid',
            description: '3-column grid with cards, icons, titles, and descriptions.',
            prompt: 'Add a features section with a 3-column grid containing icons, titles, and short descriptions of key features, styled with premium hover cards.'
        },
        {
            id: 'pricing',
            name: 'Pricing Table',
            description: '3 tiers (Basic, Pro, Enterprise) with feature lists and buttons.',
            prompt: 'Add a responsive pricing section showing 3 tiers (Basic, Pro, Enterprise) with lists of features, price callouts, and checkout buttons.'
        },
        {
            id: 'testimonials',
            name: 'Testimonials Carousel',
            description: 'Client quotes, names, avatars, and star ratings.',
            prompt: 'Add a testimonial section with client quotes, names, avatars, and star ratings, styled in a clean modern layout.'
        },
        {
            id: 'contact',
            name: 'Contact Form',
            description: 'Form with validation, details, and map placeholder.',
            prompt: 'Add a responsive contact section with a form (Name, Email, Message fields), clear validation, submit button, and contact details.'
        },
        {
            id: 'faq',
            name: 'FAQ Accordion',
            description: 'Interactive expand/collapse questions and answers.',
            prompt: 'Add a clean FAQ section with accordion style questions and answers, including a smooth expand/collapse transition.'
        },
        {
            id: 'footer',
            name: 'Footer Navigation',
            description: 'Links, logo, social icons, and copyright details.',
            prompt: 'Add a comprehensive footer section with site navigation links, logo, social icons, and copyright text.'
        }
    ];

    return (
        <div className="space-y-4 pb-8">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 mb-1">Available Sections</div>
            <div className="space-y-3">
                {sectionsList.map((s) => {
                    const isLoading = sectionLoading === s.id;
                    return (
                        <motion.div
                            key={s.id}
                            whileHover={{ scale: 1.01, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                            className={`p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] transition-colors ${
                                isLoading ? 'border-violet-500/40 bg-violet-500/5' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div>
                                    <h4 className="text-xs font-semibold text-zinc-200">{s.name}</h4>
                                    <p className="text-[11px] text-zinc-400 mt-1 leading-normal">{s.description}</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!!sectionLoading}
                                    onClick={() => onAddSection(s.id, s.prompt)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                                        isLoading
                                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                            : 'bg-white/10 hover:bg-white text-zinc-300 hover:text-black border border-white/5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-ping" />
                                            Adding...
                                        </span>
                                    ) : (
                                        'Add'
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default SectionsPanel
