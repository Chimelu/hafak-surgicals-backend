# Render Deployment Setup with Keep-Alive

This guide explains how to deploy your Node.js application on Render with automatic keep-alive functionality to prevent the server from sleeping.

## Prerequisites

- Your application deployed on Render
- Node.js application with the keep-alive utility

## Setup Instructions

### 1. Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following configuration:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

### 2. Configure Environment Variables

In your Render dashboard, add these environment variables:

```
NODE_ENV=production
RENDER_EXTERNAL_URL=https://your-app-name.onrender.com
```

**Important**: Replace `your-app-name` with your actual Render app name.

### 3. How the Keep-Alive Works

The cron job will:
- Run every 14 minutes (Render free tier sleeps after 15 minutes)
- Ping your own server's `/api/health` endpoint
- Log the ping status to the console
- Automatically start when the server starts

### 4. Monitoring

You can monitor the keep-alive functionality in your Render logs:
- Look for messages like "🔄 Pinging server at: ..."
- "✅ Server ping successful" indicates the ping worked
- "❌ Server ping failed" indicates an issue

### 5. Customization

You can modify the ping interval by editing `utils/keepAlive.js`:
- Change `*/14 * * * *` to your desired cron schedule
- The current setting pings every 14 minutes

### 6. Testing Locally

To test the keep-alive locally:
1. Set `NODE_ENV=production` in your `.env` file
2. Or set `RENDER_EXTERNAL_URL=http://localhost:5000`
3. Start your server and check the console logs

## Troubleshooting

- **Server still sleeping**: Check that `RENDER_EXTERNAL_URL` is correctly set
- **Ping failures**: Verify your `/api/health` endpoint is working
- **Cron not starting**: Ensure `NODE_ENV=production` or `RENDER_EXTERNAL_URL` is set

## Notes

- This solution works for Render's free tier
- The cron job only runs in production or when `RENDER_EXTERNAL_URL` is set
- Consider upgrading to a paid plan for better reliability
