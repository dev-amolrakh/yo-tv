# Vercel Deployment Configuration

## Environment Variables Setup

### Backend (https://yo-tv-pjud.vercel.app/)

Add these environment variables in Vercel dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://amolrakh22:TmSWLisIvmVWPNfG@cluster0.zmsmm.mongodb.net/yo-tv
ADMIN_PASSWORD=#Amol@22
```

### Frontend (https://yo-tv.vercel.app/)

Add these environment variables in Vercel dashboard:

```
VITE_API_URL=https://yo-tv-pjud.vercel.app/api
```

## Deployment Steps

1. **Backend Deployment**

   - Deploy `backend` folder to Vercel
   - Set environment variables in Vercel dashboard
   - URL: https://yo-tv-pjud.vercel.app/

2. **Frontend Deployment**
   - Deploy `frontend` folder to Vercel
   - Set `VITE_API_URL` environment variable
   - URL: https://yo-tv.vercel.app/

## CORS Configuration

The backend is configured to accept requests from:

- Production: `https://yo-tv.vercel.app`
- Development: `http://localhost:3000`, `http://localhost:5173`

## Testing

- Health check: https://yo-tv-pjud.vercel.app/api/health
- Frontend: https://yo-tv.vercel.app/
