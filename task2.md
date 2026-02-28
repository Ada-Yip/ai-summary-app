## Section 6: Supabase Object Store
Supabase is an open-source Firebase alternative that provides developers with a complete backend-as-a-service platform centered around PostgreSQL, a powerful relational database system offering full SQL capabilities, real-time subscriptions, and robust extensions for scalable data management. Its object storage is an S3-compatible service designed for storing and serving files like images, videos, and user-generated content.

Website: https://supabase.com/

**Requirements**:
- Build a document upload and file management system powered by Supabase. The backend will include API endpoints to interact with Supabse.
- **Note:** The detailed requirement will be discussed in week 4 lecture.
- Make regular commits to the repository and push the update to Github.
- Capture and paste the screenshots of your steps during development and how you test the app. Show a screenshot of the documents stored in your Supabase Object Database.

Test the app in your local development environment, then deploy the app to Vercel and ensure all functionality works as expected in the deployed environment.

**Steps with major screenshots:**

1. Sign up for a Supabase account and create a new project.
2. Enable Object Storage in your Supabase project.
3. Set up your local development environment (Node.js, React, or Next.js recommended).
4. Install the Supabase JS client: `npm install @supabase/supabase-js`.
5. Initialize Supabase in your app with your project URL and anon key.
6. Build a document upload UI (e.g., drag-and-drop or file input).
7. Implement file upload logic using Supabase Storage API.
8. Create endpoints or functions to list, download, and delete files.
9. Test uploading, listing, and deleting files locally.
10. Deploy your app to Vercel and verify file management works.

<img width="2736" height="1728" alt="螢幕擷取畫面 2026-02-28 201313" src="https://github.com/user-attachments/assets/b0306cca-45c9-4b0f-ab0d-15a7459f40e6" />
<img width="2736" height="1728" alt="螢幕擷取畫面 2026-02-28 201326" src="https://github.com/user-attachments/assets/96aecf86-3f7d-4af6-9bcc-d08bad221782" />



## Section 7: AI Summary for documents
**Requirements:**  
- **Note:** The detailed requirement will be discussed in week 4 lecture.
- Make regular commits to the repository and push the update to Github.
- Capture and paste the screenshots of your steps during development and how you test the app.
- The app should be mobile-friendly and have a responsive design.
- **Important:** You should securely handlle your API keys when pushing your code to GitHub and deploying your app to the production.
- When testing your app, try to explore some tricky and edge test cases that AI may miss. AI can help generate basic test cases, but it's the human expertise to  to think of the edge and tricky test cases that AI cannot be replace. 

Test the app in your local development environment, then deploy the app to Vercel and ensure all functionality works as expected in the deployed environment. 


**Steps with major screenshots:**

1. Choose an AI summarization API (e.g., Groq AI, Cohere, or Hugging Face).
2. Securely store your API keys (use environment variables, never commit keys to GitHub).
3. Add a UI for users to select and submit documents for summarization.
4. Implement backend logic to send document content to the AI API and receive summaries.
5. Display the AI-generated summary in your app with responsive, mobile-friendly design.
6. Test the app with various documents, including edge cases and tricky formats; take screenshots.
7. Deploy your app to Vercel and verify summarization works.
8. Document how you handle API keys securely in your codebase and deployment.


## Section 8: Database Integration with Supabase  
**Requirements:**  
- Enhance the app to integrate with the Postgres database in Supabase to store the information about the documents and the AI generated summary.
- Make regular commits to the repository and push the update to Github.
- Capture and paste the screenshots of your steps during development and how you test the app.. Show a screenshot of the data stored in your Supabase Postgres Database.

Test the app in your local development environment, then deploy the app to Vercel and ensure all functionality works as expected in the deployed environment.

**Steps with major screenshots:**

1. In Supabase, create a Postgres table to store document metadata and AI summaries.
2. Update your backend to save document info and summaries to the Supabase database after upload/summarization.
3. Implement endpoints or functions to retrieve, update, and delete records as needed.
4. Test storing and retrieving data locally.
5. Deploy your app to Vercel and verify database integration works.



## Section 9: Additional Features [OPTIONAL]
Implement at least one additional features that you think is useful that can better differentiate your app from others. Describe the feature that you have implemented and provide a screenshot of your app with the new feature.

1. Brainstorm and select an additional feature (e.g., document tagging, search, user authentication, or sharing).
2. Implement the feature in your app.
3. Test the new feature and take screenshots.
4. Describe the feature and paste a screenshot of your app with the new feature below.
> [Description of your additional features with screenshot goes here]
