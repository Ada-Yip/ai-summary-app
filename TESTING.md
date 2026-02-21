# Testing Checklist

This document provides a comprehensive testing checklist to verify all features of the Document Summary App are working correctly.

## Pre-Testing Setup

- [ ] Node.js and npm are installed
- [ ] `.env.local` file is created with all required environment variables
- [ ] Supabase project is created with "Document" and "Summary" buckets
- [ ] OpenAI API key is valid and has available credits
- [ ] Run `npm install` to install all dependencies
- [ ] Run `npm run dev` to start the development server
- [ ] Application loads at `http://localhost:3000`

## Main Page Testing

### Upload Section
- [ ] Upload form displays with file input and Upload button
- [ ] Can select a TXT file
- [ ] Can select a PDF file
- [ ] Upload button is disabled when no file is selected
- [ ] Upload button is disabled while uploading
- [ ] Success message displays after upload
- [ ] File appears in the "Your Documents" table

### Documents List
- [ ] Documents table displays all uploaded files
- [ ] Files show correct type (TXT/PDF)
- [ ] "View" button links to document view page
- [ ] "Summary" button links to summary page
- [ ] "Delete" button appears for each document

### Delete Functionality
- [ ] Click "Delete" shows confirmation dialog
- [ ] Confirming deletion removes file from table
- [ ] Associated summary is also deleted
- [ ] Success message displays after deletion
- [ ] Canceling deletion keeps the document

## Document View Page

### TXT File Display
- [ ] TXT file content displays correctly
- [ ] Text formatting is preserved
- [ ] Long content can be scrolled
- [ ] Navigation bar shows "Back to Documents" link

### PDF File Display
- [ ] PDF text is extracted and displayed
- [ ] Text formatting is readable
- [ ] Large PDFs display correctly
- [ ] Error handling works for corrupted PDFs

### Navigation
- [ ] "Back to Documents" button returns to main page
- [ ] Correct document name is displayed in header
- [ ] Page layout matches other pages

## Summary Page Testing

### UI Elements
- [ ] Summary page displays document name in header
- [ ] "Generate New Summary" section is visible
- [ ] Requirements textarea accepts input
- [ ] Language dropdown has options (English, Chinese, Japanese)
- [ ] "Generate New Summary" button is visible

### Summary Generation
- [ ] Without requirements:
  - [ ] Click "Generate New Summary"
  - [ ] "Generating Summary..." appears
  - [ ] Completion displays summary text
  - [ ] Loading state clears

- [ ] With requirements:
  - [ ] Enter custom requirement text
  - [ ] Click "Generate New Summary"
  - [ ] Summary reflects the requirements
  - [ ] Language selection works correctly

### Language Support
- [ ] English summary generates
- [ ] Chinese summary generates
- [ ] Japanese summary generates

### Summary Display
- [ ] Generated summary appears in "Current Summary" section
- [ ] Summary text is readable
- [ ] "Edit Summary" button is visible

### Edit Functionality
- [ ] Click "Edit Summary" enables edit mode
- [ ] Textarea contains the current summary
- [ ] Can modify summary text
- [ ] Click "Save Summary" persists changes
- [ ] Success message displays
- [ ] Summary updates in display
- [ ] Click "Cancel" discards changes without saving

### Error Handling
- [ ] Error message displays if API fails
- [ ] Error message clears after successful operation
- [ ] Empty document handling works
- [ ] Network error handling is graceful

## API Endpoint Testing

### Documents API
- [ ] POST `/api/documents/upload` returns 200 with path
- [ ] GET `/api/documents/list` returns file list
- [ ] POST `/api/documents/delete` returns 200
- [ ] POST `/api/documents/get-url` returns public URL
- [ ] POST `/api/documents/extract-text` returns extracted text

### Summary API
- [ ] POST `/api/summary/generate` returns summary
- [ ] POST `/api/summary/update` returns success
- [ ] POST `/api/summary/get` returns existing summary or null

## File Types Testing

### TXT Files
- [ ] Plain text files upload correctly
- [ ] Content displays without formatting
- [ ] Special characters handled correctly
- [ ] Very large TXT files work (within 50MB limit)

### PDF Files
- [ ] PDF files upload correctly
- [ ] Text extraction works
- [ ] Multi-page PDFs extract all text
- [ ] Formatted text displays correctly
- [ ] Images in PDFs don't prevent text extraction

## Storage Testing

### Supabase Storage
- [ ] Files appear in Supabase Document bucket
- [ ] Summaries appear in Supabase Summary bucket
- [ ] Public URLs work correctly
- [ ] Deleted files are removed from storage

## Error Scenarios

### File Upload Errors
- [ ] Uploading unsupported file type shows error
- [ ] Uploading file exceeding size limit shows error
- [ ] Network error during upload displays error message

### Summary Generation Errors
- [ ] Missing API key shows clear error
- [ ] Invalid API key shows error
- [ ] Insufficient API credits shows error
- [ ] Large documents that exceed token limits show error

### Network Errors
- [ ] Offline mode shows appropriate errors
- [ ] Timeouts are handled gracefully
- [ ] Retry mechanism works (if implemented)

## Performance Testing

### Load Times
- [ ] Main page loads in < 2 seconds
- [ ] Document view loads in < 3 seconds (depending on file size)
- [ ] Summary page loads in < 2 seconds

### Large Files
- [ ] 50MB TXT file uploads and displays
- [ ] Large PDF files extract text
- [ ] UI remains responsive during processing

## Browser Compatibility

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile responsive layout (if implemented)

## Security Testing

- [ ] API keys are not exposed in client code
- [ ] No sensitive data in console logs
- [ ] CORS properly configured
- [ ] File access is controlled

## Production Deployment

- [ ] Build completes without errors: `npm run build`
- [ ] No console errors or warnings
- [ ] All features work on production domain
- [ ] Environment variables properly set in deployment platform
- [ ] Rate limiting is in place (if implemented)

## Final Checks

- [ ] All buttons are styled consistently
- [ ] Navigation works smoothly
- [ ] Status messages are clear and helpful
- [ ] Loading states are intuitive
- [ ] Error messages guide users to resolution
- [ ] No layout breaking on different screen sizes
- [ ] All text is in English as required
- [ ] No emojis are used in the UI

## Sign-Off

- Date Tested: _______________
- Tested By: _________________
- All Tests Passed: Yes / No
- Notes: ____________________

---

## Common Issues and Solutions

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution**: Run `npm install` to install dependencies

### Issue: OpenAI API returns 401 error
**Solution**: Verify API key is correct and has no extra spaces in .env.local

### Issue: Supabase bucket not found
**Solution**: Ensure buckets are named exactly "Document" and "Summary" (case-sensitive)

### Issue: PDF extraction returns empty text
**Solution**: Check if PDF is encrypted or corrupted; try uploading a different PDF

### Issue: Files uploaded but don't appear in list
**Solution**: Verify Supabase buckets are public; check storage permissions
