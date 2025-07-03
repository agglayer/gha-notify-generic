# Slack Notification GitHub Action

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/linter.yml)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A powerful GitHub Action to send rich formatted messages to any Slack channel
using a Slack bot.

## Features

- 📨 Send messages to any Slack channel using channel ID
- 🎨 Support for rich Slack markdown formatting
- 🧵 Thread support (reply to existing messages)
- 🔗 Link and media unfurling options
- 📎 Get message permalinks as outputs
- ✅ Comprehensive error handling and logging

## Setup

You have two options for setting up the Slack bot:

### Option 1: Use the Shared Bot (Recommended)

A shared bot is available for everyone to use! Simply use the `SLACK_APP_TOKEN_AGGLAYER_NOTIFY_GENERIC` secret in your workflows - no additional setup required.

```yaml
- name: Send Slack notification
  uses: agglayer/gha-notify-generic@v1
  with:
    slack-bot-token: ${{ secrets.SLACK_APP_TOKEN_AGGLAYER_NOTIFY_GENERIC }}
    channel-id: 'C1234567890'
    message: 'Hello from GitHub Actions! 🚀'
```

### Option 2: Create Your Own Slack Bot

If you prefer to use your own bot:

1. Go to [Slack API](https://api.slack.com/apps) and create a new app
2. Navigate to "OAuth & Permissions" in your app settings
3. Add the following bot token scopes:
   - `chat:write` - Send messages
   - `chat:write.public` - Send messages to channels the bot isn't in
   - `channels:read` - Read public channel information
   - `groups:read` - Read private channel information (optional)
4. Install the app to your workspace
5. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

#### Add Your Token to GitHub Secrets

Add your Slack bot token as a GitHub secret:

- Go to your repository Settings → Secrets and variables → Actions
- Add a new secret (e.g., `SLACK_BOT_TOKEN`) with your bot token as the value

### Get Your Channel ID

To find your Slack channel ID:

1. Open Slack in a web browser
2. Navigate to the channel you want to send messages to
3. Look at the URL - the channel ID is the string after `/archives/` (e.g.,
   `C1234567890`)

## Usage

### Basic Usage

```yaml
name: Slack Notification
on:
  push:
    branches: [main]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack notification
        uses: agglayer/gha-notify-generic@v1
        with:
          slack-bot-token: ${{ secrets.SLACK_APP_TOKEN_AGGLAYER_NOTIFY_GENERIC }}
          channel-id: 'C1234567890'
          message: 'Hello from GitHub Actions! 🚀'
```

### Advanced Usage with Rich Formatting

```yaml
- name: Deploy notification
  uses: agglayer/gha-notify-generic@v1
  with:
    slack-bot-token: ${{ secrets.SLACK_APP_TOKEN_AGGLAYER_NOTIFY_GENERIC }}
    channel-id: 'C1234567890'
    message: |
      🚀 *Deployment Successful!*

      • Repository: `${{ github.repository }}`
      • Branch: `${{ github.ref_name }}`
      • Commit: <${{ github.event.head_commit.url }}|${{ github.sha }}>
      • Actor: @${{ github.actor }}

      View the deployment: https://my-app.com
    unfurl-links: true
```

### Using Custom Bot Token

```yaml
- name: Send with custom bot
  uses: agglayer/gha-notify-generic@v1
  with:
    slack-bot-token: ${{ secrets.CUSTOM_SLACK_TOKEN }}
    channel-id: 'C1234567890'
    message: 'Message from custom bot'
```

### Reply in Thread

```yaml
- name: Send thread reply
  uses: agglayer/gha-notify-generic@v1
  with:
    slack-bot-token: ${{ secrets.SLACK_APP_TOKEN_AGGLAYER_NOTIFY_GENERIC }}
    channel-id: 'C1234567890'
    message: 'This is a reply in the thread'
    thread-ts: '1234567890.123456' # timestamp of parent message
```

## Inputs

| Input              | Description                                                  | Required | Default |
| ------------------ | ------------------------------------------------------------ | -------- | ------- |
| `slack-bot-token`  | Slack Bot Token (xoxb-...) for authenticating with the Slack API | Yes      | -       |
| `channel-id`       | Slack channel ID where the message should be sent            | Yes      | -       |
| `message`          | Message content to send. Supports Slack markdown formatting  | Yes      | -       |
| `thread-ts`        | Timestamp of the parent message to reply in thread           | No       | -       |
| `unfurl-links`     | Whether to unfurl links in the message                       | No       | `true`  |
| `unfurl-media`     | Whether to unfurl media in the message                       | No       | `true`  |

### Link and Media Unfurling

**Link unfurling** (`unfurl-links`) controls whether Slack automatically generates rich previews for URLs in your message. When enabled (default), links to GitHub, websites, and other services will show expanded previews with titles, descriptions, and metadata. When disabled, links appear as plain clickable text.

**Media unfurling** (`unfurl-media`) works similarly but specifically for media content like images, videos, and audio files. When enabled, media URLs will display inline previews.

Set these to `false` if you want cleaner, more compact messages without automatic previews.

## Outputs

| Output       | Description                        |
| ------------ | ---------------------------------- |
| `message-ts` | Timestamp of the sent message      |
| `channel`    | Channel where the message was sent |
| `permalink`  | Permalink to the sent message      |

## Slack Message Formatting

This action supports Slack's markdown formatting:

- **Bold**: `*bold text*`
- _Italic_: `_italic text_`
- `Code`: `` `code` ``
- Code blocks: ` ```code block``` `
- Links: `<https://example.com|Link text>`
- User mentions: `<@U1234567890>`
- Channel mentions: `<#C1234567890>`
- Lists: Use `•` or `*` for bullet points

## Error Handling

The action provides comprehensive error handling:

- ❌ Missing required inputs
- ❌ Invalid Slack tokens
- ❌ Channel not found or insufficient permissions
- ❌ API rate limiting
- ❌ Network connectivity issues

All errors are logged with clear messages to help with debugging.

## Examples

### CI/CD Pipeline Notifications

```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # ... your test steps ...

      - name: Notify test results
        if: always()
        uses: agglayer/gha-notify-generic@v1
        with:
          slack-bot-token: ${{ secrets.SLACK_APP_TOKEN_AGGLAYER_NOTIFY_GENERIC }}
          channel-id: 'C1234567890'
          message: |
            ${{ job.status == 'success' && '✅' || '❌' }} Tests ${{ job.status }}

            • Repository: `${{ github.repository }}`
            • PR: #${{ github.event.number }}
            • Commit: `${{ github.sha }}`
```

### Security Alert

```yaml
- name: Security alert
  uses: agglayer/gha-notify-generic@v1
  with:
    slack-bot-token: ${{ secrets.SLACK_APP_TOKEN_AGGLAYER_NOTIFY_GENERIC }}
    channel-id: 'C9876543210' # security channel
    message: |
      🚨 *Security Alert*

      Suspicious activity detected in repository `${{ github.repository }}`

      Details:
      • Event: ${{ github.event_name }}
      • Actor: ${{ github.actor }}
      • Time: ${{ github.event.head_commit.timestamp }}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
