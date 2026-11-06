# Verified vacancy publication policy

The public directory at `/public/jobsites.json` lists *platforms*, not individual jobs.
The separate `/public/verified-vacancies.json` contains **only independently reviewed individual vacancies**.
An empty array is intentional until there is a verified listing; do not seed sample or invented jobs.

A reviewer must confirm:
1. The position exists on the employer's official site or an authorised recruitment service.
2. Its employer, title, location, application destination and closing date are authentic.
3. The opportunity is current, and the link is a publicly accessible HTTPS URL.
4. Nobody is charged a placement fee or asked to submit sensitive records to Skunkworks.
5. The listing has a stable, unique `id`, `reviewedAt` (UTC date), `reviewedBy` (reviewer handle),
   `expiresAt` (UTC closing date), `sourceUrl`, `applyUrl`, `title`, `employer`, `location`,
   and optional `workMode` ("Remote", "Hybrid", "Onsite").

Example for documentation **only — DO NOT PUBLISH**:
```json
{
  "id": "example-cloud-engineer",
  "title": "Cloud Engineer",
  "employer": "Example Employer",
  "location": "Johannesburg, South Africa",
  "workMode": "Hybrid",
  "applyUrl": "https://employer.example/careers/123",
  "sourceUrl": "https://employer.example/careers/123",
  "reviewedAt": "2026-11-06",
  "reviewedBy": "academy-editor",
  "expiresAt": "2026-11-30"
}
```

Run `node scripts/validate-verified-vacancies.mjs` before approving a feed update.
The public page suppresses entries older than 30 days or past their closing date.
A vacancy's publication is not a guarantee of employment, recruitment or availability.
Learners use their Academy portal's **Career & jobs** workspace to record their own
applications; those records are private and never written to this public repository.
