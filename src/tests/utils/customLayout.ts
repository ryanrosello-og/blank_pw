import fs from "fs";
import path from "path";
import { Block, KnownBlock } from "@slack/types";
import { SummaryResults } from "playwright-slack-report/dist/src";
// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const web_api_1 = require('@slack/web-api');
const slackClient = new web_api_1.WebClient(process.env.SLACK_BOT_USER_OAUTH_TOKEN);

async function uploadFile(filePath) {
  try {
    const result = await slackClient.files.uploadV2({
      channel_id: 'C05H7TKVDUK',
      file: fs.createReadStream(filePath),
      filename: filePath.split('/').at(-1),
    });

    return result.file;
  } catch (error) {
    console.log('🔥🔥 error', error);
  }
}


export async function generateCustomLayoutAsync (summaryResults: SummaryResults): Promise<Array<KnownBlock | Block>> {
  const { tests } = summaryResults;
  // create your custom slack blocks

  const header = {
    type: "header",
    text: {
      type: "plain_text",
      text: "🎭 *Playwright E2E Test Results*",
      emoji: true,
    },
  };

  const summary = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `✅ *${summaryResults.passed}* | ❌ *${summaryResults.failed}* | ⏩ *${summaryResults.skipped}*`,
    },
  };

  const fails: Array<KnownBlock | Block> = [];

  for (const t of tests) {
    if (t.status === "failed" || t.status === "timedOut") {

      fails.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `👎 *[${t.browser}] | ${t.suiteName.replace(/\W/gi, "-")}*`,
        },
      });

      const assets: Array<string> = [];

      if (t.attachments) {
        for (const a of t.attachments) {
          const file = await uploadFile(a.path);

          if (file) {
            if (a.name === 'screenshot' && file.permalink) {
              fails.push({
                alt_text: '',
                image_url: file.permalink,
                title: { type: 'plain_text', text: file.name || '' },
                type: 'image',
              });
            }

            if (a.name === 'video' && file.permalink) {
              fails.push({
                alt_text: '',
                // NOTE:
                // Slack requires thumbnail_url length to be more that 0
                // Either set screenshot url as the thumbnail or add a placeholder image url
                thumbnail_url: '',
                title: { type: 'plain_text', text: file.name || '' },
                type: 'video',
                video_url: file.permalink,
              });
            }
          }
        }
      }
      if (assets.length > 0) {
        fails.push({
          type: "context",
          elements: [{ type: "mrkdwn", text: assets.join("\n") }],
        });
      }
    }
  }

  return [header, summary, { type: "divider" }, ...fails]
}