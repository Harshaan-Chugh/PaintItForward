# Paint It Forward

## Project Overview

Paint It Forward is a nonprofit initiative that brings joy to seniors by driving art painting initiatives. This website streamlines signups as well as volunteer hour tracking, admin approval workflows, and impact reporting.


## Architecture

**Step-by-Step Request Flow:**

1. **User Access**: User visits website via custom domain (Route 53 DNS)
2. **Content Delivery**: CloudFront CDN serves static files from S3 bucket
3. **Frontend Loading**: Next.js React application loads in user's browser
4. **Authentication**: User logs in via Google OAuth 2.0, receives JWT token
5. **API Requests**: Frontend makes HTTP requests to API Gateway with Bearer token
6. **Request Routing**: API Gateway routes requests to appropriate Lambda function
7. **Authentication Validation**: Lambda validates JWT token with Google's tokeninfo endpoint
8. **Authorization Check**: Lambda verifies user permissions (admin vs regular user)
9. **Database Operations**: Lambda performs CRUD operations on DynamoDB table
10. **Response Processing**: Lambda formats response and returns to API Gateway
11. **Frontend Update**: API Gateway returns response to frontend for UI updates

## Tech Stack

### Frontend
- **Next.js 15.4.4**
- **React 19.1.0** 
- **TypeScript 5.8.3**
- **Tailwind CSS 4**
- **@react-oauth/google**
### Backend
- **AWS Lambda** - Serverless 
- **API Gateway** - RESTful APIs
- **DynamoDB** - NoSQL database
- **CloudFront** - Global CDN
- **S3** - Static file hosting
- **Route 53** - DNS management

## Project Structure

```
paintitfwd.org/
├── src/
│   └── frontend/               # Next.js React application
│       ├── src/
│       │   ├── app/           # Next.js 13+ app router pages
│       │   │   ├── page.tsx           # Landing page
│       │   │   ├── portal/            # Volunteer portal
│       │   │   ├── admin/             # Admin dashboard  
│       │   │   ├── contact/           # Contact page
│       │   │   └── about/             # About page
│       │   └── components/     # Reusable React components
│       │       ├── AdminDashboard.tsx # Admin interface
│       │       ├── HourForm.tsx       # Hour logging form
│       │       ├── HoursList.tsx      # User's hours display
│       │       └── LoginButton.tsx    # Google OAuth login
│       ├── public/            # Static assets
│       └── out/               # Built static files (deployed to S3)
├── lambda-dynamo.js           # Main Lambda function
├── cloudfront-*.json         # CloudFront configurations
└── README.md
```


## API Endpoints

### Public Endpoints
- `GET /hours/total` - Get total approved volunteer hours

### Authenticated Endpoints
- `POST /hours` - Submit new volunteer hours
- `GET /hours` - Get user's submitted hours

### Admin-Only Endpoints
- `GET /admin/pending` - Get pending hours for approval
- `GET /admin/all` - Get all submissions with statistics
- `GET /admin/export` - Download CSV export of all data
- `PATCH /admin/approve` - Approve/reject volunteer hours

## Database Schema

**DynamoDB Table: `HoursTable`**
```javascript
{
  user_email: "email@gmail.com",    // Primary key
  start_time: "2025-07-29T10:00:00.000Z",   // Sort key
  user_name: "Harshaan Chugh",
  end_time: "2025-07-29T14:00:00.000Z",
  hours: 4.0,
  description: "Created artwork for seniors",
  status: "pending|approved|rejected",
  created_at: "2025-07-29T10:00:00.000Z",
  updated_at: "2025-07-29T11:00:00.000Z"
}
```

## Data Flow

### Volunteer Hour Submission
```
User fills form → JWT validation → Lambda processes → 
DynamoDB stores → Admin reviews → Approval → Hours count toward total
```

### Admin Approval Workflow
```
Admin login → Fetch pending hours → Review submissions → 
Approve/Reject → Update DynamoDB → Generate reports
```

## Deployment

### Frontend Deployment
1. **Build:** `npm run build` in `src/frontend/`
2. **Upload:** Static files to S3 bucket
3. **CDN:** CloudFront distribution for global delivery
4. **DNS:** Route 53 pointing to CloudFront

### Backend Deployment
1. **Lambda:** `lambda-dynamo.js` deployed to AWS Lambda
2. **API Gateway:** HTTP API with Lambda proxy integration
3. **Database:** DynamoDB table with on-demand billing
4. **Permissions:** IAM roles for Lambda → DynamoDB access

## AWS Resources

- **Lambda Function:** `paintitforward-hours` (Node.js 22.x)
- **API Gateway:** `5ikdmjfw3g.execute-api.us-west-1.amazonaws.com`
- **DynamoDB Table:** `HoursTable`
- **S3 Bucket:** Static website hosting
- **CloudFront:** CDN distribution

## Local Development

### Prerequisites
- Node.js 18+ and npm
- AWS CLI configured
- Google OAuth 2.0 credentials

### Frontend Setup
```bash
cd src/frontend
npm install
npm run dev
```

### Environment Variables
```bash
# src/frontend/.env.local
NEXT_PUBLIC_API_URL=https://your-api-gateway-url
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Lambda Development
```bash
# Test Lambda locally
node lambda-dynamo.js

# Deploy to AWS
zip lambda-dynamo.zip lambda-dynamo.js
aws lambda update-function-code --function-name paintitforward-hours --zip-file fileb://lambda-dynamo.zip
```

## Features

### For Volunteers
- **Google OAuth Login** - Secure authentication
- **Hour Logging** - Easy form to submit volunteer time
- **Personal Dashboard** - View submitted hours and status
- **Real-time Updates** - See approval status instantly

### For Admins
- **Approval Dashboard** - Review and approve/reject submissions
- **Data Visualization** - Real-time statistics and summaries
- **CSV Export** - Download comprehensive volunteer reports
- **Bulk Operations** - Efficiently manage multiple submissions

### For Public
- **Impact Metrics**
- **Mission Information**
- **Contact Forms**
