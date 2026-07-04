import fs from 'node:fs/promises';

import inquirer from 'inquirer';

const questions = [
  {
    type: 'input',
    name: 'PLAUSIBLE_API_URL',
    message: 'Enter your Plausible URL:',
    default: 'https://plausible.io',
  },
  {
    type: 'input',
    name: 'PLAUSIBLE_API_TOKEN',
    message: 'Enter your Plausible API token:',
    validate: input => (input.length > 0 ? true : 'Token is required'),
  },
];

async function setup() {
  try {
    const answers = await inquirer.prompt(questions);

    // Create .env.local for both Nuxt and the ASP.NET Core API
    const envLocal = [
      `NUXT_PUBLIC_API_BASE=http://localhost:8080`,
      `NUXT_PUBLIC_PLAUSIBLE_DOMAIN=dev.bach.software`,
      `PLAUSIBLE_API_URL=${answers.PLAUSIBLE_API_URL}`,
      `PLAUSIBLE_API_TOKEN=${answers.PLAUSIBLE_API_TOKEN}`,
      `CORS_ALLOWED_ORIGINS=localhost`,
      '',
    ].join('\n');

    await fs.writeFile('.env.local', envLocal);

    // eslint-disable-next-line no-console
    console.log('✅ Development environment files created successfully!');
  }
  catch (error) {
    console.error('❌ Error:', error);
  }
}

setup();
