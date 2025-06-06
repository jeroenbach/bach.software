// setup.js
import fs from "fs/promises";

import inquirer from "inquirer";

const questions = [
  {
    type: "input",
    name: "PLAUSIBLE_API_URL",
    message: "Enter your Plausible URL (default: https://plausible.io):",
  },
  {
    type: "input",
    name: "PLAUSIBLE_API_TOKEN",
    message: "Enter your Plausible API token:",
    validate: (input) => (input.length > 0 ? true : "Token is required"),
  },
];

async function setup() {
  try {
    const answers = await inquirer.prompt(questions);

    // Create local.settings.json for Azure Functions
    const localSettings = {
      IsEncrypted: false,
      Values: {
        AzureWebJobsStorage: "",
        FUNCTIONS_WORKER_RUNTIME: "dotnet-isolated",
        PLAUSIBLE_API_URL: answers.PLAUSIBLE_API_URL,
        PLAUSIBLE_API_TOKEN: answers.PLAUSIBLE_API_TOKEN,
      },
      Host: {
        LocalHttpPort: 7071,
        CORS: "*",
        CORSCredentials: false,
      },
    };

    // Create .env.local for Nuxt
    let envLocal = `NUXT_PUBLIC_API_BASE=http://localhost:7071\n`;
    envLocal += `NUXT_PUBLIC_PLAUSIBLE_DOMAIN=dev.bach.software\n`;

    await fs.writeFile(
      "src/api/Bach.Software.API/local.settings.json",
      JSON.stringify(localSettings, null, 2),
    );
    await fs.writeFile(".env.local", envLocal);

    console.log("✅ Development environment files created successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

setup();
