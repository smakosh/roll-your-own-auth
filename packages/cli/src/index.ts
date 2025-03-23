#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function sparseCheckout(repoUrl: string, path: string, directoryName: string) {
  try {
      console.log(chalk.yellow(`Cloning ${path} into ${directoryName}/ directory...`));
      // Create a temporary directory for cloning
      const tempDirectory = `${directoryName}_temp`;
      await execAsync(`rm -rf ${tempDirectory}`);
      await execAsync(`git clone --no-checkout ${repoUrl} ${tempDirectory}`);
      await execAsync(`cd ${tempDirectory} && git sparse-checkout init --cone`);
      await execAsync(`cd ${tempDirectory} && git sparse-checkout set ${path}`);
      await execAsync(`cd ${tempDirectory} && git checkout`);

      // Move the desired content up to the main directoryName folder
      const fullPath = `${tempDirectory}/${path}`;
      await execAsync(`rm -rf ${directoryName}`);
      await execAsync(`mkdir ${directoryName}`);
      await execAsync(`mv ${fullPath}/* ${directoryName}`);
      await execAsync(`rm -rf ${tempDirectory}`); // Cleanup the temporary directory

  } catch (error) {
      if (error instanceof Error) {
          console.error(chalk.red(`Error during sparse checkout: ${error.message}`));
      } else {
          console.error(chalk.red('An unknown error occurred during sparse checkout.'));
      }
  }
}

function getServerExamplePath(answers: any) {
    if (answers.authMethods.includes('Sessions') && answers.serverFramework === 'Express.js' && answers.database === 'Sqlite' && answers.orm === 'Prisma') {
        return 'examples/rest-express-prisma-sessions-sqlite';
    }

    if (answers.authMethods.includes('Sessions') && answers.serverFramework === 'Express.js' && answers.database === 'Sqlite' && answers.orm === 'Drizzle') {
        return 'examples/rest-express-drizzle-sessions-sqlite';
    }

    if (answers.authMethods.includes('JWT') && answers.serverFramework === 'Express.js' && answers.database === 'Sqlite' && answers.orm === 'Prisma') {
        return 'examples/rest-express-prisma-jwt-sqlite';
    }

    return null; // Add more paths for different configurations as needed
}

function getClientExamplePath(answers: any) {
    if(answers.authMethods.includes("Sessions") && answers.clientFramework === 'Next.js') {
        return 'examples/rest-next-sessions';
    }

    if(answers.authMethods.includes("JWT") && answers.clientFramework === 'Next.js') {
        return 'examples/rest-next-jwt';
    }

    if(answers.authMethods.includes("Sessions") && answers.clientFramework === 'TanStack Start') {
        return 'examples/rest-tanstack-sessions';
    }

    return null; // Add more paths for different client frameworks as needed
}

async function cloneExamples(answers: any) {
    const repoUrl = 'https://github.com/smakosh/roll-your-own-auth.git';

    const serverPath = getServerExamplePath(answers);
    if (serverPath) {
        await sparseCheckout(repoUrl, serverPath, 'server');
    } else {
        console.log(chalk.red('No matching server example found for the selected options.'));
    }

    const clientPath = getClientExamplePath(answers);
    if (clientPath) {
        await sparseCheckout(repoUrl, clientPath, 'client');
    } else {
        console.log(chalk.red('No matching client example found for the selected options.'));
    }

    console.log(chalk.green('Setup complete!'));
}

const program = new Command();

program
  .command('init')
  .description('Initialize a new authentication setup')
  .action(() => {
    console.log(chalk.green('Starting the ryo-auth initialization process...'));
    initQuestions();
  });

program.parse(process.argv);

function initQuestions() {
    inquirer.prompt([
        {
            type: 'checkbox',
            name: 'authMethods',
            message: 'Pick the auth approach you\'d like:',
            // @TODO: choices: ['Sessions', 'JWT', 'SSO', 'Passwordless', '2FA'],
            choices: ['Sessions', 'JWT'],
        },
        {
            type: 'list',
            name: 'serverFramework',
            message: 'Server side, pick the server side framework you are using:',
            // @TODO: choices: ['Express.js', 'Hono', 'Fastify', 'Fast API'],
            choices: ['Express.js'],
        },
        {
            type: 'list',
            name: 'database',
            message: 'Pick the Database you would like to use:',
            // @TODO: choices: ['Postgres', 'MongoDB', 'Sqlite'],
            choices: ['Sqlite'],
        },
        {
            type: 'list',
            name: 'orm',
            message: 'Pick the ORM you would to use:',
            choices: ['Prisma', 'Drizzle'],
        },
        {
            type: 'list',
            name: 'clientFramework',
            message: 'Now client side, pick the client side framework you are using:',
            // @TODO: choices: ['Next.js', 'Vite.js', 'Remix'],
            choices: ['Next.js', 'TanStack Start'],
        },
    ]).then(cloneExamples);
}
