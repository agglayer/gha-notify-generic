import * as core from '@actions/core'
import { WebClient } from '@slack/web-api'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const slackToken = core.getInput('slack-bot-token')
    const channelId = core.getInput('channel-id')
    const message = core.getInput('message')
    const threadTs = core.getInput('thread-ts') || undefined
    const unfurlLinks = core.getInput('unfurl-links') === 'true'
    const unfurlMedia = core.getInput('unfurl-media') === 'true'

    // Validate required inputs
    if (!slackToken) {
      throw new Error('slack-bot-token input is required.')
    }

    if (!channelId) {
      throw new Error('channel-id input is required.')
    }

    if (!message) {
      throw new Error('message input is required.')
    }

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Sending message to Slack channel: ${channelId}`)
    core.debug(`Message: ${message}`)

    // Initialize Slack Web API client
    const slack = new WebClient(slackToken)

    // Prepare message options
    const messageOptions: {
      channel: string
      text: string
      unfurl_links: boolean
      unfurl_media: boolean
      thread_ts?: string
    } = {
      channel: channelId,
      text: message,
      unfurl_links: unfurlLinks,
      unfurl_media: unfurlMedia
    }

    // Add optional parameters if provided
    if (threadTs) {
      messageOptions.thread_ts = threadTs
    }

    // Send the message
    core.info(`Sending message to Slack channel ${channelId}...`)
    const result = await slack.chat.postMessage(messageOptions)

    if (!result.ok) {
      throw new Error(`Failed to send Slack message: ${result.error}`)
    }

    core.info('✅ Message sent successfully to Slack!')

    // Set outputs for other workflow steps to use
    core.setOutput('message-ts', result.ts)
    core.setOutput('channel', result.channel)

    // Generate permalink if possible
    if (result.ts && result.channel) {
      try {
        const permalinkResult = await slack.chat.getPermalink({
          channel: result.channel,
          message_ts: result.ts
        })

        if (permalinkResult.ok && permalinkResult.permalink) {
          core.setOutput('permalink', permalinkResult.permalink)
          core.info(`📎 Message permalink: ${permalinkResult.permalink}`)
        }
      } catch (permalinkError) {
        core.warning('Could not generate permalink for the message')
        core.debug(`Permalink error: ${permalinkError}`)
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(`❌ Slack notification failed: ${error.message}`)
    } else {
      core.setFailed(
        '❌ An unknown error occurred while sending Slack notification'
      )
    }
  }
}
