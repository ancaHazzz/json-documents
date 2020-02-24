import { createConnection } from "typeorm"


export async function init() {
  const connection = await createConnection()
  await connection.synchronize()
  return connection
}