import { getManager, createQueryBuilder } from 'typeorm'
import { DocumentVersion } from '../entity/DocumentVersion'
import { Document } from '../entity/Document'

export async function storeDocument(date: Date, documentId: string, newContent: any) {
  try {
    let document = await getManager().findOne(Document, { documentId })
    if (!document) {
      document = new Document()
      document.documentId = documentId
      document.lastChangeDate = date
      document = await getManager().save(document)
    }
    const docVersions = await getManager().count(DocumentVersion, {
      where: { document: { index: document.index } }
    })
    const docUpdate = new DocumentVersion()
    docUpdate.changeDate = date
    docUpdate.document = document
    docUpdate.version = +docVersions
    docUpdate.content = newContent
    const resp = await getManager().save(docUpdate)
    return resp.version
  } catch (err) {
    console.error(err)
  }
}

export async function getDocumentHistory(documentId: string) {
  const document = await getManager().findOne(Document, {
    where: { documentId },
    relations: ['versions']
  })
  return document?.versions
}

export async function getDocumentVersion(documentId: string, version: string) {
  return await createQueryBuilder('DocumentVersion')
    .select('DocumentVersion.content')
    .innerJoin('DocumentVersion.document', 'document')
    .where('document.documentId = :documentId', { documentId })
    .andWhere('DocumentVersion.version = :version', { version })
    .getOne()
}

export async function compareContents(oldContent: any, newContent: any) {
  if (!oldContent || !newContent) {
    return oldContent || newContent
  }
  const jsonDoc = JSON.parse(oldContent)
  for (const prop in jsonDoc) {
    if (Object.prototype.hasOwnProperty.call(jsonDoc, prop)) {
      const newPropValue = newContent[prop]
      if (newPropValue === jsonDoc[prop]) {
        console.debug(`${prop}: same value`)
        continue
      }
      console.debug(`${prop}: ${jsonDoc[prop]} -> ${newContent[prop]}`)
    }
  }
}
