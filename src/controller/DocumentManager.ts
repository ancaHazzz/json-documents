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
    .getOne() as DocumentVersion
}

export function compareContents(content1: any, content2: any) {
  if (!content1 || !content2) {
    return content1 || content2
  }
  const comparison = []
  for (const prop in content1) {
    if (Object.prototype.hasOwnProperty.call(content1, prop)) {
      if (!content2[prop]) {
        comparison.push(`${prop} - ${content1[prop]} -> deleted`)
      } else {
        comparison.push(`${prop} - ${content1[prop]} -> ${content2[prop]}`)
      }
    }
  }
  for (const prop in content2) {
    if (Object.prototype.hasOwnProperty.call(content2, prop)) {
      if (!content1[prop]) {
        comparison.push(`new property - ${prop}: ${content2[prop]}`)
      }
    }
  }
  return comparison.join('\r\n')
}
