import { generateResponse } from "../config/openRouter.js";
import User from "../models/user.model.js";
import Website from "../models/website.model.js";
import extractJson from "../utils/extractJson.js";
import Submission from "../models/submission.model.js";
import { colorPalettes, themes, fonts, animationPresets } from "../config/designTokens.js";
import { masterPrompt, ENHANCE_SYSTEM_PROMPT } from "../config/prompts.js";


export const generateWebsite = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 50) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        const finalPrompt = masterPrompt.replace("USER_PROMPT", prompt)
        let raw = ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed; i++) {
            raw = await generateResponse(finalPrompt)
            parsed = await extractJson(raw)

            if (!parsed) {
                raw = await generateResponse(finalPrompt + "\n\nRETURN ONLY RAW JSON.")
                parsed = await extractJson(raw)
            }

        }

        if (!parsed.code) {
            console.log("ai returned invalid response", raw)
            return res.status(400).json({ message: "ai returned invalid response" })
        }

        const website = await Website.create({
            user: user._id,
            title: prompt.slice(0, 60),
            latestCode: parsed.code,
            conversation: [
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "ai",
                    content: parsed.message
                }
                
            ]
        })

        user.credits = user.credits - 50
        await user.save()

        return res.status(201).json({
            websiteId: website._id,
            remainingCredits: user.credits
        })

    } catch (error) {
        return res.status(500).json({ message: `generate website error ${error}` })
    }
}


export const getWebsiteById = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
        return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get website by id error ${error}` })
    }
}


export const changes = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 25) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        const updatePrompt = `
UPDATE THIS HTML WEBSITE.

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

RETURN RAW JSON ONLY:
{
  "message": "Short confirmation",
  "code": "<UPDATED FULL HTML>"
}
`
        let raw = ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed; i++) {
            raw = await generateResponse(updatePrompt)
            parsed = await extractJson(raw)

            if (!parsed) {
                raw = await generateResponse(updatePrompt + "\n\nRETURN ONLY RAW JSON.")
                parsed = await extractJson(raw)
            }

        }

        if (!parsed.code) {
            console.log("ai returned invalid response", raw)
            return res.status(400).json({ message: "ai returned invalid response" })
        }


        website.conversation.push(
            { role: "user", content: prompt },
            { role: "ai", content: parsed.message },
        )

        // Re-apply design settings if they exist on the website
        let updatedCode = parsed.code
        if (website.designSettings) {
            const generatedCSS = generateCSSFromSettings(website.designSettings)
            updatedCode = injectDesignOverrides(updatedCode, generatedCSS)
            updatedCode = injectSEO(updatedCode, website.designSettings.seoTitle, website.designSettings.seoDescription, website.title)
        }

        website.latestCode = updatedCode

        await website.save()
        user.credits = user.credits - 25
        await user.save()

        return res.status(200).json({
            message:parsed.message,
            code:updatedCode,
            remainingCredits: user.credits
        })


    } catch (error) {
        console.log(error)
 return res.status(500).json({ message: `update website error ${error}` })
    }
}



export const getAll=async (req,res) => {
    try {
        const websites=await Website.find({user:req.user._id})
        return res.status(200).json(websites)
    } catch (error) {
        return res.status(500).json({ message: `get all websites error ${error}` })
    }
}


export const deploy=async (req,res)=>{
    try {
         const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        if(!website.slug){
            website.slug=website.title.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,60)+website._id.toString().slice(-5)              
        }

        website.deployed=true
        website.deployUrl=`${process.env.FRONTEND_URL}/site/${website.slug}`
        await website.save()

        return res.status(200).json({
            url:website.deployUrl
        })

    } catch (error) {
         return res.status(500).json({ message: `deploy website error ${error}` })
    }
}


export const getBySlug=async (req,res) => {
    try {
         const website = await Website.findOne({
            slug: req.params.slug
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
          return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get by slug website error ${error}` })
    }
}


export const saveCode = async (req, res) => {
    try {
        const { code } = req.body
        if (!code) {
            return res.status(400).json({ message: "code is required" })
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        website.latestCode = code
        await website.save()

        return res.status(200).json({ message: "Code saved successfully" })

    } catch (error) {
        return res.status(500).json({ message: `save code error ${error}` })
    }
}



export const enhancePrompt = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }

        try {
            const raw = await generateResponse(prompt, ENHANCE_SYSTEM_PROMPT)
            let enhancedPrompt = raw ? raw.trim() : prompt

            // Clean up enclosing quotes if returned by the model
            if (enhancedPrompt.startsWith('"') && enhancedPrompt.endsWith('"')) {
                enhancedPrompt = enhancedPrompt.slice(1, -1).trim()
            } else if (enhancedPrompt.startsWith("'") && enhancedPrompt.endsWith("'")) {
                enhancedPrompt = enhancedPrompt.slice(1, -1).trim()
            }

            return res.status(200).json({
                enhancedPrompt,
                enhanced: true
            })
        } catch (apiError) {
            console.error("AI prompt enhancement failed, returning original prompt:", apiError)
            return res.status(200).json({
                enhancedPrompt: prompt,
                enhanced: false
            })
        }
    } catch (error) {
        return res.status(500).json({ message: `enhance prompt error ${error}` })
    }
}

const generateCSSFromSettings = (settings) => {
    // 1. Resolve Font
    const fontConfig = fonts[settings.font] || fonts['inter']
    const fontImport = fontConfig.importUrl
    const fontFamily = fontConfig.family

    // 2. Resolve Color Palette
    let primaryColor = '#2563eb'
    let secondaryColor = '#3b82f6'
    let accentColor = '#60a5fa'

    if (settings.customColor) {
        primaryColor = settings.customColor
        secondaryColor = primaryColor + 'cc'
        accentColor = primaryColor + '99'
    } else {
        const palette = colorPalettes[settings.colorPalette] || colorPalettes['professional-blue']
        primaryColor = palette.primary
        secondaryColor = palette.secondary
        accentColor = palette.accent
    }

    // 3. Resolve Theme
    const themeConfig = themes[settings.theme] || themes['dark']
    const darkColor = themeConfig.dark
    const lightColor = themeConfig.light
    const grayColor = themeConfig.gray
    const extraCSS = themeConfig.extraCSS

    // 4. Resolve Animation Preset
    const animationCSS = animationPresets[settings.animationPreset] || animationPresets['fade-in']

    return `
        ${fontImport}
        :root {
            --primary: ${primaryColor} !important;
            --secondary: ${secondaryColor} !important;
            --accent: ${accentColor} !important;
            --dark: ${darkColor} !important;
            --light: ${lightColor} !important;
            --gray: ${grayColor} !important;
        }
        body, select, input, textarea, button, h1, h2, h3, h4, h5, h6, p, a, span {
            font-family: ${fontFamily} !important;
        }
        ${extraCSS}
        ${animationCSS}
    `
}

const injectDesignOverrides = (html, css) => {
    const tagStart = '<style id="sf-design-overrides">'
    const tagEnd = '</style>'
    const overrideStyleBlock = `${tagStart}\n${css}\n${tagEnd}`
    
    const startIndex = html.indexOf(tagStart)
    if (startIndex !== -1) {
        const endIndex = html.indexOf(tagEnd, startIndex)
        if (endIndex !== -1) {
            return html.substring(0, startIndex) + overrideStyleBlock + html.substring(endIndex + tagEnd.length)
        }
    }
    
    const headEndIndex = html.toLowerCase().indexOf('</head>')
    if (headEndIndex !== -1) {
        return html.substring(0, headEndIndex) + overrideStyleBlock + "\n" + html.substring(headEndIndex)
    }
    
    return html
}

const injectSEO = (html, title, description, defaultTitle = "SiteForge Website") => {
    let updatedHtml = html;
    
    // Handle title
    const titleToUse = title && title.trim() ? title.trim() : defaultTitle;
    const titleRegex = /<title>([\s\S]*?)<\/title>/i;
    if (titleRegex.test(updatedHtml)) {
        updatedHtml = updatedHtml.replace(titleRegex, `<title>${titleToUse}</title>`);
    } else {
        const headStartRegex = /<head[^>]*>/i;
        if (headStartRegex.test(updatedHtml)) {
            updatedHtml = updatedHtml.replace(headStartRegex, `$&\n    <title>${titleToUse}</title>`);
        } else {
            const htmlStartRegex = /<html[^>]*>/i;
            if (htmlStartRegex.test(updatedHtml)) {
                updatedHtml = updatedHtml.replace(htmlStartRegex, `$&\n<head>\n    <title>${titleToUse}</title>\n</head>`);
            } else {
                updatedHtml = `<title>${titleToUse}</title>\n` + updatedHtml;
            }
        }
    }
    
    // Handle description
    const descRegex = /<meta\s+[^>]*(name|content)=["']description["'][^>]*>/i;
    if (description && description.trim()) {
        if (descRegex.test(updatedHtml)) {
            updatedHtml = updatedHtml.replace(descRegex, `<meta name="description" content="${description.trim()}">`);
        } else {
            const headStartRegex = /<head[^>]*>/i;
            if (headStartRegex.test(updatedHtml)) {
                updatedHtml = updatedHtml.replace(headStartRegex, `$&\n    <meta name="description" content="${description.trim()}">`);
            } else {
                const htmlStartRegex = /<html[^>]*>/i;
                if (htmlStartRegex.test(updatedHtml)) {
                    updatedHtml = updatedHtml.replace(htmlStartRegex, `$&\n<head>\n    <meta name="description" content="${description.trim()}">\n</head>`);
                } else {
                    updatedHtml = `<meta name="description" content="${description.trim()}">\n` + updatedHtml;
                }
            }
        }
    } else {
        if (descRegex.test(updatedHtml)) {
            updatedHtml = updatedHtml.replace(descRegex, '');
        }
    }
    
    return updatedHtml;
}

export const updateDesignSettings = async (req, res) => {
    try {
        const { designSettings } = req.body
        if (!designSettings) {
            return res.status(400).json({ message: "designSettings object is required" })
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(404).json({ message: "website not found" })
        }

        // Apply partial update to designSettings
        website.designSettings = {
            ...website.designSettings,
            ...designSettings
        }

        // Generate and inject overridden CSS
        const generatedCSS = generateCSSFromSettings(website.designSettings)
        let updatedCode = injectDesignOverrides(website.latestCode, generatedCSS)
        
        // Inject SEO tags
        updatedCode = injectSEO(updatedCode, website.designSettings.seoTitle, website.designSettings.seoDescription, website.title)
        
        website.latestCode = updatedCode

        // Save back to DB
        await website.save()

        return res.status(200).json(website)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: `update design settings error ${error}` })
    }
}

export const submitForm = async (req, res) => {
    try {
        const { id } = req.params
        const { formName, data } = req.body

        const website = await Website.findById(id)
        if (!website) {
            return res.status(404).json({ message: "website not found" })
        }

        const submission = await Submission.create({
            website: id,
            formName: formName || "Contact Form",
            data: data || {}
        })

        return res.status(201).json({
            message: "Form submitted successfully",
            submissionId: submission._id
        })
    } catch (error) {
        console.error("Submit form error:", error)
        return res.status(500).json({ message: `submit form error ${error}` })
    }
}

export const getSubmissionsByWebsiteId = async (req, res) => {
    try {
        const { id } = req.params
        const website = await Website.findOne({
            _id: id,
            user: req.user._id
        })

        if (!website) {
            return res.status(404).json({ message: "website not found" })
        }

        const submissions = await Submission.find({ website: id }).sort({ createdAt: -1 })
        return res.status(200).json(submissions)
    } catch (error) {
        console.error("Get submissions error:", error)
        return res.status(500).json({ message: `get submissions error ${error}` })
    }
}