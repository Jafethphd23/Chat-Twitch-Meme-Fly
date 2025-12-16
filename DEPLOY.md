# Deploy to Fly.io

## Prerequisites
- Fly CLI installed: https://fly.io/docs/hands-on/install-flyctl/
- Fly.io account

## Setup

### 1. Login to Fly
```bash
fly auth login
```

### 2. Create the app (first time only)
```bash
fly launch --no-deploy
```

### 3. Set secrets (environment variables)
```bash
fly secrets set OPENAI_API_KEY=your_openai_key
fly secrets set TWITCH_BOT_USERNAME=your_bot_username
fly secrets set TWITCH_ACCESS_TOKEN=your_twitch_oauth_token
fly secrets set BOT_CHANNEL=nagayama_meme
fly secrets set TARGET_LANGUAGE=Spanish
```

### 4. Deploy
```bash
fly deploy
```

### 5. Scale the bot process (IMPORTANT - keeps bot running 24/7)
```bash
fly scale count bot=1 web=1
```

This ensures:
- **web**: Dashboard (auto-stops when not in use to save money)
- **bot**: Twitch bot (runs 24/7, never stops)

## GitHub Actions (Optional)

For automatic deploys from GitHub, add this secret to your repo:
- `FLY_API_TOKEN`: Get from `fly tokens create deploy -x 999999h`

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Fly.io
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Useful Commands

```bash
# View logs
fly logs

# View bot process logs only
fly logs --process bot

# SSH into machine
fly ssh console

# Check status
fly status

# Scale processes
fly scale count bot=1 web=1
```
