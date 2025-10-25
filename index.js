import * as readline from "readline";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import { SuiAgentKit } from "@getnimbus/sui-agent-kit";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools = [
  {
    type: "function",
    function: {
      name: "get_holdings",
      description: "Get all token balances in the wallet",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

const agent = new SuiAgentKit(
  process.env.SUI_PRIVATE_KEY,
  process.env.RPC_URL,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
);

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const input = await new Promise((resolve) => {
      rl.question("\nPrompt: ", resolve);
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are helpful assistant",
        },
        {
          role: "user",
          content: input,
        },
      ],
      tools: tools,
      tool_choice: "auto",
    });
    const message = response.choices[0].message;
    if (message.tool_calls && message.tool_calls.length > 0) {
      const functionName = message.tool_calls[0].function.name;
      if (functionName === "get_holdings") {
        const holdings = await agent.getHoldings();
        console.log(holdings);
      }
    } else {
      console.log(message.content);
    }
  }
}

main();
