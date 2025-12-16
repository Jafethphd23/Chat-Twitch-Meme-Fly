import { TwitchBot } from "./bot";

const bot = new TwitchBot();

const channel = process.env.BOT_CHANNEL || "nagayama_meme";
const targetLanguage = process.env.TARGET_LANGUAGE || "Spanish";

console.log(`[BOT-RUNNER] Starting autonomous bot...`);
console.log(`[BOT-RUNNER] Channel: ${channel}`);
console.log(`[BOT-RUNNER] Target Language: ${targetLanguage}`);

async function start() {
  try {
    bot.onEvent((event) => {
      console.log(`[EVENT] ${event.type}:`, JSON.stringify(event.data));
    });
    
    await bot.start({
      channel,
      targetLanguage,
    });
    
    console.log(`[BOT-RUNNER] Bot started successfully!`);
    console.log(`[BOT-RUNNER] Listening for messages in #${channel}`);
    console.log(`[BOT-RUNNER] Commands: !ton (start translation), !toff (stop translation), !chibi <message>`);
    
  } catch (error) {
    console.error(`[BOT-RUNNER] Failed to start bot:`, error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log(`[BOT-RUNNER] Shutting down...`);
  await bot.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log(`[BOT-RUNNER] Received SIGTERM, shutting down...`);
  await bot.stop();
  process.exit(0);
});

start();
