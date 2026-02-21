# Supabase Setup and Verification Guide

This guide helps you properly set up and verify the Supabase Object Storage buckets for the Document Summary App.

## Required Supabase Configuration

The app requires **two separate Object Storage buckets** in your Supabase project:

1. **Document Bucket** - Stores uploaded documents (TXT and PDF files)
2. **Summary Bucket** - Stores generated and edited summaries

## Bucket Structure

### Document Bucket Structure:
```
Bucket: "Document"
├── documents/
│   ├── file1.txt
│   ├── file2.pdf
│   └── ...
```

### Summary Bucket Structure:
```
Bucket: "Summary"
├── summaries/
│   ├── file1.txt.txt
│   ├── file2.pdf.txt
│   └── ...
```

## Setup Steps in Supabase Dashboard

### 1. Create the "Document" Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **+ New Bucket**
4. Enter bucket name: `Document`
5. Leave **Public bucket** **UNCHECKED** initially (we'll add specific permissions)
6. Click **Create Bucket**

### 2. Configure Document Bucket Policies

After creating the Document bucket, you need to set up access policies:

1. Click on the **Document** bucket
2. Go to the **Policies** tab
3. Click **+ Add new policy** or use the policy builder
4. Create a policy to allow public read access:
   - Policy name: `Public Read`
   - Target roles: `Public`
   - Grant permissions: `SELECT` (read)
   - For: `(bucket_id = 'Document')`
5. Create a policy to allow authenticated users to upload:
   - Policy name: `Authenticated Upload`
   - Target roles: `Authenticated`
   - Grant permissions: `INSERT, UPDATE, DELETE`
   - For: `(bucket_id = 'Document')`

**Or enable Public bucket with these steps:**
1. In the Storage section, scroll to the Document bucket
2. Click the three dots menu and select **Edit bucket**
3. Toggle **Public bucket** to ON
4. Save

### 3. Create the "Summary" Bucket

Repeat the same process for the Summary bucket:

1. Click **+ New Bucket**
2. Enter bucket name: `Summary`
3. Leave **Public bucket** **UNCHECKED** initially
4. Click **Create Bucket**

### 4. Configure Summary Bucket Policies

Set up the same policies for the Summary bucket:
1. Click on the **Summary** bucket
2. Go to **Policies** tab
3. Add the same policies (Public Read, Authenticated Upload/Update/Delete)

**Or enable Public bucket:**
1. Click the three dots menu and select **Edit bucket**
2. Toggle **Public bucket** to ON
3. Save

## Verify Your Setup

### Check via Supabase Dashboard

1. Go to **Storage** → **Buckets**
2. Verify you see both **Document** and **Summary** buckets
3. Click on each bucket to verify it's set to public access

### Check via the App

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser (typically http://localhost:3000)

3. Try uploading a test document:
   - Click "Upload Document"
   - Select a small test file (TXT or PDF)
   - Click Upload
   - If successful, you should see it in the list

4. Check the Supabase dashboard:
   - Go to **Storage** → **Document** bucket
   - You should see your uploaded file in the `documents/` folder

5. If you see a file there but the app doesn't list it:
   - Check the browser console for error messages
   - Check the app's terminal output for API errors
   - Verify the bucket permissions are set to public

### Debugging Tips

If documents don't appear in the list:

1. **Check Environment Variables**
   - Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_KEY`
   - These should match your Supabase project settings

2. **Check Browser Console**
   - Open Developer Tools (F12 or Ctrl+Shift+I)
   - Go to **Console** tab
   - Look for error messages when listing/uploading files

3. **Check Server Logs**
   - Look at the terminal where `npm run dev` is running
   - You should see logs like:
     - `Attempting to list documents from Supabase...`
     - `Successfully listed X documents`
     - Or error details if something fails

4. **Verify Bucket Access**
   - In Supabase dashboard, click on Document bucket
   - Try downloading a file directly to verify it exists
   - Check if the bucket is marked as "public"

5. **Check Permissions**
   - Go to Storage → Document → Policies
   - Verify policies are set up correctly
   - Test with both authenticated and public access

## Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-anon-or-service-role-key
```

Get these values from:
1. Supabase Dashboard → **Project Settings** → **API**
2. Use the `anon` key (public) for browser-based access

## Common Issues and Solutions

### Issue: "Cannot access Supabase bucket" error

**Solution:**
- Verify buckets exist in the Supabase dashboard
- Check that bucket names are exactly: `Document` and `Summary` (case-sensitive)
- Ensure buckets are set to public access
- Verify policies allow public read access

### Issue: Uploaded files don't appear in the list

**Solution:**
- Check that files are being uploaded to the `documents/` folder (not root of bucket)
- Verify the list endpoint is checking the correct folder: `list('documents')`
- Check Supabase dashboard to confirm file exists

### Issue: Summary generation fails

**Solution:**
- Verify the `Summary` bucket exists and is public
- Check that the summary is being saved to `summaries/` folder
- Verify the Summary bucket has proper write permissions

### Issue: "Failed to download file" when viewing document

**Solution:**
- Verify the file path is correct
- Check that the bucket is public and allows read access
- Try downloading the file directly from Supabase dashboard to verify it's accessible

## Testing Checklist

- [ ] Both buckets ("Document" and "Summary") exist in Supabase
- [ ] Both buckets are set to public access
- [ ] Environment variables are set correctly
- [ ] Can upload a test document through the app
- [ ] Test document appears in the Supabase Storage dashboard
- [ ] Can view the uploaded document
- [ ] Can generate a summary
- [ ] Summary is saved to the Summary bucket
- [ ] Can edit the summary
- [ ] Can delete a document (also removes summary)

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security)
- [Supabase Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
