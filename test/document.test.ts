import { init } from '../src/service/Database'
import { storeDocument, getDocumentVersion } from '../src/controller/DocumentManager'

const JSON_TEMPLATE = {
  document: {
    property1: 'value1',
    property2: 'value2',
    property3: 'value3'
  }
}

describe('test sncf operations', () => {
  beforeAll(async () => {
    await init()
    // I should also clean the test db
  })

  test('store & get document', async done => {
    const docId = 'abc'
    const documentVersion = await storeDocument(new Date(), docId, JSON_TEMPLATE)
    expect(documentVersion).toBeTruthy()
    const savedDocument = await getDocumentVersion(docId, documentVersion!.toString())
    expect(savedDocument).toBeTruthy()
    expect(savedDocument.content).toEqual(JSON_TEMPLATE)
    done()
  })
  

})
