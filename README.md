<a href="https://semantic-search.vercel.app">
  <img alt="Next.js 14 and App Router Semantic Search." src="https://semantic-image-search.vercel.app/opengraph-image.png">
  <h1 align="center">Semantic Image Search</h1>
</a>

<p align="center">
  An open-source AI semantic image search app template built with Next.js, the Vercel AI SDK, Azure OpenAI, Vercel Postgres, Vercel Blob and Vercel KV. Includes image generation and a Chrome extension for saving images from the web.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a> ·
  <a href="#chrome-extension"><strong>Chrome Extension</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
- React Server Components (RSCs), Suspense, and Server Actions
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for multimodal prompting, generating & embedding image metadata, and streaming images from Server to Client
- Support for Azure OpenAI (default), OpenAI, Gemini, Anthropic, Cohere, or custom AI chat models
- AI-powered image generation with Azure DALL-E 3
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - [Radix UI](https://radix-ui.com) for headless component primitives
- Query caching with [Vercel KV](https://vercel.com/storage/kv)
- Embeddings powered by [Vercel Postgres](https://vercel.com/storage/kv), [pgvector](https://github.com/pgvector/pgvector-node#drizzle-orm), and [Drizzle ORM](https://orm.drizzle.team/)
- File (image) storage with [Vercel Blob](https://vercel.com/storage/blob)
- Chrome extension for saving images from any webpage

## Model Providers

This template ships with Azure OpenAI `GPT-4o` as the default. However, thanks to the [Vercel AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [OpenAI](https://openai.com), [Gemini](https://gemini.google.com/), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [more](https://sdk.vercel.ai/providers/ai-sdk-providers) with just a few lines of code.

## Deploy Your Own

You can deploy your own version of the Semantic Image Search App to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRealNickey%2Fsemantic-image-search&env=AZURE_API_KEY,BLOB_READ_WRITE_TOKEN,POSTGRES_URL&envDescription=Azure%20OpenAI%20API%20key,%20Vercel%20Blob%20token,%20and%20Postgres%20URL%20needed&envLink=https%3A%2F%2Fazure.microsoft.com%2Fen-us%2Fproducts%2Fcognitive-services%2Fopenai-service)

## Setup

### Azure OpenAI Configuration

This application uses Azure OpenAI for AI capabilities. You'll need to set up an Azure OpenAI resource:

1. Create an [Azure OpenAI resource](https://azure.microsoft.com/en-us/products/cognitive-services/openai-service)
2. Deploy the following models:
   - `gpt-4o` for image analysis and metadata generation
   - `text-embedding-3-small` for generating embeddings
   - `dall-e-3` for image generation (optional)
3. Get your resource name, API key, and deployment names
4. If using image generation, get your DALL-E endpoint and API key

### Creating a KV Database Instance

Follow the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database) provided by Vercel. This guide will assist you in creating and configuring your KV database instance on Vercel, enabling your application to interact with it.

Remember to update your environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) in the `.env` file with the appropriate credentials provided during the KV database setup.

### Creating a Postgres Database Instance

Follow the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-postgres/quickstart) provided by Vercel. This guide will assist you in creating and configuring your Postgres database instance on Vercel, enabling your application to interact with it.

Once you have instantiated your Vercel Postgres instance, run the following code to enable `pgvector`:
```bash
CREATE EXTENSION vector;
```

Remember to update your environment variable (`POSTGRES_URL`) in the `.env` file with the appropriate credentials provided during the Postgres database setup.

### Creating a Blob Instance

Follow the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-blob) provided by Vercel. This guide will assist you in creating and configuring your Blob instance on Vercel, enabling your application to interact with it.

Remember to update your environment variable (`BLOB_READ_WRITE_TOKEN`) in the `.env` file with the appropriate credentials provided during the Blob setup.


## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js Semantic Image Search. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `AZURE_RESOURCE_NAME`: Your Azure OpenAI resource name
- `AZURE_API_KEY`: Your Azure OpenAI API key
- `AZURE_GPT4O_DEPLOYMENT_NAME`: Name of your GPT-4o deployment
- `AZURE_EMBEDDING_DEPLOYMENT_NAME`: Name of your text-embedding-3-small deployment
- `POSTGRES_URL`: Your Vercel Postgres connection string
- `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob storage token
- `KV_REST_API_URL`: Your Vercel KV REST API URL
- `KV_REST_API_TOKEN`: Your Vercel KV REST API token

Optional (for image generation):
- `AZURE_DALLE_ENDPOINT`: Your Azure DALL-E 3 endpoint
- `AZURE_DALLE_API_KEY`: Your Azure DALL-E 3 API key

## Add Azure OpenAI API Key
Be sure to add your Azure OpenAI API key and configure your Azure deployments in your `.env` file.

## Database Setup
To push your schema changes to your Vercel Postgres database, run the following command.
```bash
pnpm run db:generate
pnpm run db:push
```

## Prepare your Images (Indexing Step)

You have several options to add images to your semantic search collection:

### Option 1: Bulk Upload (Traditional Method)
To get your application ready for Semantic search using bulk upload, you will have to complete three steps:
1. Upload Images to storage
2. Send Images to a Large Language Model to generate metadata (title, description)
3. Iterate over each image, embed the metadata, and then save to the database

#### Upload Images
Put the images you want to upload in the `images-to-index` directory (.jpg format) at the root of your application. Run the following command:
```bash
pnpm run upload
```
This script will upload the images to your Vercel Blob store.
Depending on how many photos you are uploading, this step could take a while.

#### Generate Metadata
Run the following command:
```bash
pnpm run generate-metadata
```
This script will generate metadata for each of the images you uploaded in the previous step.
Depending on how many photos you are uploading, this step could take a while.

#### Embed Metadata and Save to Database
Run the following command:
```bash
pnpm run embed-and-save
```
Depending on how many photos you are uploading, this step could take a while. This script will embed the descriptions generated in the previous step and save them to your Vercel Postgres instance.

### Option 2: Upload via Web Interface
Once your application is running, you can upload images directly through the web interface. This will automatically generate metadata, embeddings, and save to the database.

### Option 3: Chrome Extension
Install the included Chrome extension to save images from any webpage directly to your collection. See the [Chrome Extension](#chrome-extension) section below.

### Option 4: AI Image Generation
Use the built-in image generation feature to create images with Azure DALL-E 3 and automatically add them to your collection.

## Clear Data (Optional)
If you need to clear all images and start fresh:
```bash
pnpm run clear-data
```
This will delete all images from both the database and blob storage.

## Starting the Server
Run the following command
```bash
pnpm run dev
```
Your app template should now be running on [localhost:3000](http://localhost:3000/).

## Chrome Extension

This repository includes a Chrome extension called "Image Pocket" that allows you to save images from any webpage directly to your semantic image search collection.

### Features
- Right-click context menu to save images
- Hover over images to see a save button
- Bulk save all images from a page
- Automatic metadata generation with web context
- Recent images popup interface

### Installation

1. **Build the Next.js app** (if not already done):
   ```bash
   pnpm build
   ```

2. **Set up the extension**:
   ```bash
   pnpm run setup-extension
   ```
   This command will prepare the extension with your app configuration.

3. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `chrome-extension` folder from this project

4. **Configure the extension**:
   - Click the extension icon in Chrome
   - Set your app URL (e.g., `http://localhost:3000` or `https://your-app.vercel.app`)

### Usage
- **Right-click any image** → Select "Save to Image Pocket"
- **Hover over images** → Click the save button that appears
- **Click extension icon** → View recent saves and bulk save options

For more details, see the [Chrome Extension README](chrome-extension/README.md).

## Authors

This library is created by [Vercel](https://vercel.com) and [Next.js](https://nextjs.org) team members, with contributions from:

- Jared Palmer ([@jaredpalmer](https://twitter.com/jaredpalmer)) - [Vercel](https://vercel.com)
- Shu Ding ([@shuding\_](https://twitter.com/shuding_)) - [Vercel](https://vercel.com)
- shadcn ([@shadcn](https://twitter.com/shadcn)) - [Vercel](https://vercel.com)
- Lars Grammel ([@lgrammel](https://twitter.com/lgrammel)) - [Vercel](https://vercel.com)
- Nico Albanese ([@nicoalbanese10](https://twitter.com/nicoalbanese10)) - [Vercel](https://vercel.com)
