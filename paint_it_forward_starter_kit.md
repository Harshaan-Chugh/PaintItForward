# PaintItForward – Full Stack Starter Kit

A clean one‑pager marketing site + a secure volunteer‑hours portal, built locally first and deployed to AWS with near‑zero cost.

---

## 0. What You’re Building

- **Public One‑Pager**: Hero section, mission, impact stats, gallery/testimonials, CTA buttons ("Log Hours", "Donate", "Join Us").
- **Portal**: Google sign‑in → submit & view hours, edit drafts, see approval status.
- **Admin view (optional)**: List/filter "pending" entries (via GSI on `status`).
- **Backend**: Lambda + API Gateway + DynamoDB (email=start\_time keys). 100% serverless.
- **Infra as Code**: SST (or CDK) so local dev = prod-like.

---

## 1. Tech Choices (Opinionated Defaults)

| Layer    | Tooling                                                                    | Why                                                   |
| -------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| Frontend | **Next.js** + Tailwind                                                     | SSR/SPA hybrid, fast dev, great SEO for the one-pager |
| Auth     | Google OAuth on the frontend + JWT to backend **or** Cognito Federated IdP | Quick sign-in, no user DB                             |
| API      | AWS Lambda (Node/TS) behind API Gateway HTTP APIs                          | Cheap, simple routing                                 |
| DB       | DynamoDB (Provisioned low RCUs/WCUs)                                       | Free tier forever for your scale                      |
| Infra    | **SST v3** (CDK under the hood)                                            | Local live Lambdas, hot reload, simple deploy         |
| Local DB | DynamoDB Local (Docker)                                                    | Offline dev w/out hitting AWS                         |

> Swap SST for Serverless Framework/SAM/CDK if you prefer; patterns stay the same.

---

## 2. Data Model

```ts
// PK: email, SK: start_time (ISO8601)
{
  email: "alex@example.org",
  start_time: "2025-07-20T09:00:00Z",
  end_time: "2025-07-20T12:00:00Z",
  status: "pending" | "approved" | "rejected",
  description: "Beach cleanup sorting",
  created_at: "2025-07-20T09:05:00Z",
  updated_at: "2025-07-20T09:05:00Z"
}
```

**GSI**: `status-index` → PK = status, SK = start\_time (or created\_at) for admin queries across users.

---

## 3. Repo Layout

```
paintitforward/
├─ packages/
│  ├─ frontend/           # Next.js app (one-pager + portal)
│  └─ api/                # Lambda handlers (TypeScript)
├─ stacks/                # SST/CDK infrastructure definitions
├─ .env.local             # Frontend env
├─ .env                   # SST dev env vars
├─ docker-compose.yml     # DynamoDB Local
└─ README.md
```

---

## 4. Infrastructure (SST Example)

**Install & bootstrap**

```bash
npm create sst@latest paintitforward
cd paintitforward
npm install
```

``** (core idea)**

```ts
import { StackContext, Table, Api, Auth } from "sst/constructs";

export function MyStack({ stack }: StackContext) {
  const table = new Table(stack, "HoursTable", {
    fields: {
      email: "string",
      start_time: "string",
      status: "string"
    },
    primaryIndex: { partitionKey: "email", sortKey: "start_time" },
    globalIndexes: {
      statusIndex: { partitionKey: "status", sortKey: "start_time" }
    }
  });

  const api = new Api(stack, "Api", {
    defaults: { function: { environment: { TABLE_NAME: table.tableName } } },
    routes: {
      "POST   /hours": "packages/api/src/handlers/createHour.handler",
      "GET    /hours": "packages/api/src/handlers/listHours.handler",
      "PATCH  /hours/{email}/{start_time}": "packages/api/src/handlers/updateHour.handler",
      "GET    /admin/pending": "packages/api/src/handlers/listPending.handler"
    }
  });

  table.grantReadWriteData(api);

  // If you go Cognito: (SST has an Auth construct, you can federate Google)
  // Otherwise, skip and validate Google ID token manually in Lambdas.

  stack.addOutputs({ ApiUrl: api.url });
}
```

---

## 5. Lambda Handlers (TypeScript)

``

```ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { verifyGoogleIdToken } from "../utils/auth"; // custom util

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (evt: any) => {
  try {
    const authHeader = evt.headers?.authorization || ""; // "Bearer <id-token>"
    const { email } = await verifyGoogleIdToken(authHeader);
    const body = JSON.parse(evt.body || "{}");

    const { start_time, end_time, description } = body;
    if (!start_time || !end_time) return resp(400, { error: "Missing times" });

    const item = {
      email,
      start_time,
      end_time,
      status: "pending",
      description: description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return resp(201, item);
  } catch (e: any) {
    console.error(e);
    return resp(401, { error: "Unauthorized" });
  }
};

const resp = (code: number, body: any) => ({
  statusCode: code,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
```

> Repeat similar patterns for list, update, etc. Use Query on `email` to list a user’s hours; for admin list, query GSI `statusIndex`.

`` (manual Google token verify)

```ts
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(authHeader: string) {
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) throw new Error("No token");
  const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Invalid token");
  return { email: payload.email, name: payload.name };
}
```

---

## 6. Frontend (Next.js + Tailwind)

**Install**

```bash
cd packages
npx create-next-app@latest frontend --ts --eslint --tailwind
```

**Key pages/components**

```
frontend/src/app/page.tsx             # One-pager
frontend/src/app/portal/page.tsx      # Hours dashboard (protected)
frontend/src/components/Navbar.tsx
frontend/src/components/HourForm.tsx
```

**Google Sign-In (frontend)**

- Use `@react-oauth/google` or the new Google Identity Services SDK.
- On login success, store ID token in memory/localStorage and attach to `Authorization: Bearer <idToken>` on API calls.

Example (simplified):

```tsx
// app/providers.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';
export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      {children}
    </GoogleOAuthProvider>
  );
}
```

```tsx
// components/LoginButton.tsx
import { useGoogleLogin } from '@react-oauth/google';

export function LoginButton({ onToken }: { onToken: (t: string)=>void }) {
  const login = useGoogleLogin({
    onSuccess: cred => onToken(cred.credential!),
    flow: 'implicit'
  });
  return <button onClick={() => login()}>Sign in with Google</button>;
}
```

```tsx
// components/HourForm.tsx
import { useState } from 'react';

export function HourForm({ token }: { token: string }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [desc, setDesc] = useState("");
  async function submit() {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/hours", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ start_time: start, end_time: end, description: desc })
    });
    // handle response
  }
  // render inputs...
}
```

---

## 7. Local Development Workflow

1. **Run DynamoDB Local**

```yaml
# docker-compose.yml
version: '3.8'
services:
  dynamodb:
    image: amazon/dynamodb-local
    command: -jar DynamoDBLocal.jar -inMemory -sharedDb
    ports: ["8000:8000"]
```

Create table locally via SST (it will auto-create) or AWS CLI:

```bash
aws dynamodb create-table \
  --table-name HoursTable \
  --attribute-definitions AttributeName=email,AttributeType=S AttributeName=start_time,AttributeType=S \
  --key-schema AttributeName=email,KeyType=HASH AttributeName=start_time,KeyType=RANGE \
  --billing-mode PROVISIONED --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --endpoint-url http://localhost:8000
```

2. **Start SST (hot-reload Lambdas)**

```bash
npm run dev      # inside root (sst dev)
```

SST will expose a local API URL; update `NEXT_PUBLIC_API_URL` accordingly.

3. **Run frontend**

```bash
cd packages/frontend
npm run dev
```

4. **Env Vars**

```
# .env (root)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
TABLE_NAME=HoursTable

# .env.local (frontend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:3000   # or the SST URL
```

---

## 8. Deploy to AWS (Single Command)

```bash
# In one terminal
npm run build
npm run deploy     # sst deploy --stage prod
```

Outputs will include `ApiUrl`. For the frontend, either:

- Deploy via SST StaticSite construct → uploads to S3 + CloudFront.
- Or push to Cloudflare Pages/Netlify/Vercel (just point to API URL).

Update DNS (Route 53 or Cloudflare) to point `paintitforward.org` (or alt) to the CloudFront distro.

---

## 9. Admin Tools

- Add an `is_admin` list in an env var or a small DynamoDB table.
- Lambdas check if requester’s email is in admin list before allowing `PATCH /hours/...` or `GET /admin/pending`.

---

## 10. Nice-to-Haves

- PDF/export hours (Lambda generates CSV or PDF via `pdfkit`).
- Email notification on approval (SES).
- Rate limiting (API Gateway usage plan) – unnecessary at current tiny load.
- Analytics (Plausible, Google Analytics) for the one-pager.

---

## 11. Checklist to Start Coding Today

**Frontend**

-

**Backend**

-

**Local Dev**

-

**Deploy**

-

You’re off! Ping me for deeper dives (Cognito vs. manual auth, SST config, UI polish, etc.).

