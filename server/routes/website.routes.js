import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { changes, deploy, generateWebsite, getAll, getBySlug, getWebsiteById, saveCode, enhancePrompt, updateDesignSettings, submitForm, getSubmissionsByWebsiteId } from "../controllers/website.controllers.js"


const websiteRouter=express.Router()

websiteRouter.post("/generate",isAuth,generateWebsite)
websiteRouter.post("/update/:id",isAuth,changes)
websiteRouter.get("/get-by-id/:id",isAuth,getWebsiteById)
websiteRouter.get("/get-all",isAuth,getAll)
websiteRouter.get("/deploy/:id",isAuth,deploy)
websiteRouter.get("/get-by-slug/:slug",getBySlug)
websiteRouter.patch("/save-code/:id",isAuth,saveCode)
websiteRouter.post("/enhance-prompt",isAuth,enhancePrompt)
websiteRouter.patch("/design-settings/:id",isAuth,updateDesignSettings)
websiteRouter.post("/submit-form/:id",submitForm)
websiteRouter.get("/submissions/:id",isAuth,getSubmissionsByWebsiteId)

export default websiteRouter