##Instruction
User should be able to uplaod, delete, view documents.
The app should support handling documents in text file or PDF file. 
Users can choose to view the original file directly or view it with an markdown viewer where text are extracted from the PDF or text file.

User can request to generate a summary of the document. 
User can edit the summary.
User can specify requirement for summary.
User can regenerate summary.
The summary should be in English by default. But if there is a prefereed output language, output in that language.

Summary and viewer should be in the same page of the list of file

All documents and summary should be stored externally in supabase database, separately in two buckets opened: Document, Summary.
