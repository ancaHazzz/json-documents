import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { storeDocument, getDocumentVersion, getDocumentHistory, compareContents } from './controller/DocumentManager'
import { createConnection } from 'typeorm'
import moment from 'moment'

const PORT = process.env.PORT || 3000

async function initApp() {
  await createConnection()
  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  return app
}

initApp().then(app => {
  app.get('/', (req: Request, res: Response) => {
    res.send(`Welcome! Available endpoints:
  POST /document:
    -- changeDate: optional date for this version of the document
    -- documentId: string identifying the document
    -- document: JSON content of the document
  GET /document/{documentId}/history
  GET /document/{documentId}/version/{version}
  GET /document/{documentId}/compare
   -- v1
   -- v2`)
  })

  app.post('/document', async (req: Request, res: Response) => {
    try {
      if (!req.body || !req.body.changeDate || !req.body.documentId || !req.body.document) {
        return res.status(400).json({ error: `You must provide changeDate, documentId, document` })
      }
      const date = moment(req.body.changeDate)
      if (!date.isValid()) {
        return res.status(400).json({ error: `Unrecognized date format for changeDate param` })
      }
      if (!JSON.stringify(req.body.document)) {
        return res.status(400).json({ error: `Unrecognized json format for document param` })
      }
      const result = await storeDocument(date.toDate(), req.body.documentId, req.body.document)
      res.send({ version: result })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.toString() })
    }
  })

  app.get('/document/:documentId/history', async (req: Request, res: Response) => {
    try {
      if (!req.params.documentId) {
        return res.status(400).json({ error: `You must provide a documentId` })
      }
      const result = await getDocumentHistory(req.params.documentId)
      if (!result) {
        return res.status(404).send()
      }
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.toString() })
    }
  })

  app.get('/document/:documentId/version/:version', async (req: Request, res: Response) => {
    try {
      if (!req.params.documentId || !req.params.version) {
        return res.status(400).json({ error: `You must provide documentId & version` })
      }

      const result = await getDocumentVersion(req.params.documentId, req.params.version)
      if (!result) {
        return res.status(404).send()
      }
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.toString() })
    }
  })

  app.get('/document/:documentId/compare', async (req: Request, res: Response) => {
    try {
      if (!req.params.documentId) {
        return res
          .status(400)
          .json({ error: `You must provide documentId, v1,v2. Check / for more details` })
      }
      const documentVersions = await getDocumentHistory(req.params.documentId)
      if (!documentVersions?.length) {
        return res.status(404).send('Document was not found')
      }
      const v1 = documentVersions.find(dv => dv.version === Number.parseInt(req.query.v1))
      const v2 = documentVersions.find(dv => dv.version === Number.parseInt(req.query.v2))
      if (!v1 || !v2) {
        return res.status(404).send('One of the versions was not found. Please check document history')
      }
      const result = compareContents(v1.content, v2.content)
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.toString() })
    }
  })

  app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`)
  })
})
