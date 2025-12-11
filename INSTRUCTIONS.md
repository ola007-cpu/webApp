# WeGist - TikTok-like Video App

## Prerequisites
1. **Node.js 20+** installed.
2. **Azure Account** & **MongoDB**:
   - **Azure Cosmos DB for MongoDB** (or any MongoDB instance).
   - **Azure Storage Account** (Blob Service). Container: `videos` (Access level: Blob/Public Read).

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in your credentials.
   ```bash
   # MongoDB Connection String
   MONGODB_URI=mongodb+srv://<user>:<password>@<host>/<database>?tls=true&...

   # Azure Blob Storage
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...
   AZURE_STORAGE_CONTAINER_NAME=videos
   ```

## Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Deployment
This repository handles deployment via GitHub Actions.
1. Create an **Azure Web App** (Node.js runtime).
2. Download the **Publish Profile** from the Azure Portal.
3. Add it as a GitHub Secret named `AZURE_WEBAPP_PUBLISH_PROFILE`.
4. Update `.github/workflows/azure-webapp.yml` with your app name if different.
5. Push to `main`.
