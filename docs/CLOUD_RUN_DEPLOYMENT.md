# Google Cloud Run Backend Deployment

Deploy the FastAPI backend from this repository to Google Cloud Run.

## What this setup does

- Builds the backend Docker image from the root `Dockerfile`
- Pushes image to Artifact Registry
- Deploys to Cloud Run service `maptoposter-backend`
- Prints service URL for frontend API configuration

GitHub Actions workflow file:
- `.github/workflows/cloud-run-backend.yml`

---

## 1) Prerequisites

- A Google Cloud project
- Billing enabled (Cloud Run has free tier usage limits)
- `gcloud` CLI installed locally (for one-time setup)
- GitHub repository admin access (to add secrets)

Enable required APIs:

```bash
gcloud services enable run.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com
```

---

## 2) Create Artifact Registry repository

```bash
gcloud artifacts repositories create maptoposter \
  --repository-format=docker \
  --location=us-central1 \
  --description="MapToPoster backend images"
```

---

## 3) Create service account for deployment

```bash
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Cloud Run Deployer"
```

Grant required roles:

```bash
PROJECT_ID="YOUR_GCP_PROJECT_ID"
SA="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA}" \
  --role="roles/iam.serviceAccountUser"
```

---

## 4) Configure Workload Identity Federation (recommended)

Create Workload Identity Pool:

```bash
gcloud iam workload-identity-pools create github-pool \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

Create provider:

```bash
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository"
```

Allow your GitHub repo to impersonate service account:

```bash
PROJECT_ID="YOUR_GCP_PROJECT_ID"
PROJECT_NUMBER="YOUR_PROJECT_NUMBER"
REPO="harish-ram/Moder-Map-Generator-App"
SA="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts add-iam-policy-binding "${SA}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${REPO}"
```

Build this value (needed in GitHub secret):

```text
projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

---

## 5) Add GitHub Actions secrets

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**

Add:

- `GCP_PROJECT_ID` = your project id
- `GCP_SERVICE_ACCOUNT_EMAIL` = `github-actions-deployer@<project-id>.iam.gserviceaccount.com`
- `GCP_WORKLOAD_IDENTITY_PROVIDER` = `projects/<project-number>/locations/global/workloadIdentityPools/github-pool/providers/github-provider`

---

## 6) Trigger deployment

Either:
- Push to `main` with backend-related changes, or
- Run workflow manually from **Actions → Deploy Backend to Cloud Run**

After success, workflow logs print backend URL, such as:

```text
https://maptoposter-backend-xxxxx-uc.a.run.app
```

---

## 7) Connect frontend to backend

Set GitHub secret `API_URL` (used by Pages frontend build) to the Cloud Run backend URL.

Example:

```text
https://maptoposter-backend-xxxxx-uc.a.run.app
```

Then re-run or push to trigger the GitHub Pages workflow.

---

## Notes

- Cloud Run expects container to listen on `PORT`; this repo is already configured for that.
- First request after idle may be slower on free-tier style scaling.
- Free-tier limits and pricing can change over time; check Google Cloud pricing page.
