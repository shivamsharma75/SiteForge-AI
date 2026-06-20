import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import axios from 'axios'
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

function LiveSite() {
    const {id}=useParams()
    const [html,setHtml]=useState("")
    const [error,setError]=useState("")
    useEffect(() => {
        const handleGetWebsite = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/website/get-by-slug/${id}`)
                setHtml(injectSiteForgeScript(result.data.latestCode, result.data._id, result.data.slug))
            } catch (error) {
                console.log(error)
                setError("site not found")
            }
        }
        handleGetWebsite()
    }, [id])

if(error){
    return (
        <div className='h-screen flex items-center justify-center bg-black text-white'>
            {error}
        </div>
    )
}
  return (
    <iframe title='Live Site' srcDoc={html} className='w-screen h-screen border-none' sandbox='allow-scripts allow-same-origin allow-forms'/>
  )
}

export default LiveSite
