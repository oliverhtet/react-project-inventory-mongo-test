# Ecommerce with React

A full-featured ecommerce application built with Next.js, MongoDB.

## CI/CD with GitHub Actions

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

### Setting Up GitHub Actions

1. **Add Repository Secrets**

   Go to your GitHub repository settings, then to "Secrets and variables" > "Actions", and add the following secrets:

   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key for authentication
   - `VERCEL_TOKEN`: Your Vercel personal access token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

2. **Getting Vercel Deployment Tokens**

   To get your Vercel deployment tokens, follow these steps:

   - Install the Vercel CLI: `npm i -g vercel`
   - Run `vercel login` and authenticate
   - Run `vercel link` to link your local project to a Vercel project
   - This will create a `.vercel` directory with `project.json` file containing your `projectId` and `orgId`
   - Create a personal access token from the Vercel dashboard (Settings > Tokens)

3. **Workflow Files**

   The GitHub Actions workflow files are located in the `.github/workflows` directory:

   - `ci.yml`: Runs linting, type checking, and builds the application
   - `test.yml`: Runs tests
   - `deploy.yml`: Deploys the application to Vercel

## Development

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your environment variables
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Seeding

To seed the database with sample data:

```bash
npm run seed

