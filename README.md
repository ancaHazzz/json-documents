Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command. The data will be automatically seeded into your database.

The project uses 2 tables to store the json documents: a Document table with the master data and a DocumentVersion table with each state of the document. I had a dilemma whether to store the DocumentVersion per whole json content or per property. I went for the version with the whole document, because it requires a simpler query to get each state of the document and there's no need to overengineer.
