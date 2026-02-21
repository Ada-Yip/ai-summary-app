##Instruction
User should be able to uplaod, delete, view documents.
The app should support handling documents in text file or PDF file. 
If it is a PDF file, there should be an extra page where text are extracted from the PDF.

User can request to generate a summary of the document. 
User can edit the summary.
User can specify requirement for summary.
The summary should be in English by default. But if there is a prefereed output language, output in that language.

All documents and summary should be stored externally in supabase database, separately in two buckets opened: Document, Summary.
