#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { mkdir, copyFile } from 'fs/promises';
import { dirname } from 'path';

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

// Available example sources that `add` can copy auth code from.
const ADD_SOURCES: Record<string, string> = {
  'session-express-prisma': 'examples/rest-express-prisma-sessions-sqlite',
  'session-express-drizzle': 'examples/rest-express-drizzle-sessions-sqlite',
  'jwt-express-prisma': 'examples/rest-express-prisma-jwt-sqlite',
  'session-next': 'examples/rest-next-sessions',
  'jwt-next': 'examples/rest-next-jwt',
  'session-tanstack': 'examples/rest-tanstack-sessions',
  'jwt-nest-prisma': 'examples/rest-nest-prisma-jwt-postgres',
};

/**
 * shadcn-style: sparse-checkout an example, then copy only its `src/` auth code
 * into the user's project instead of scaffolding the whole app.
 */
async function addComponent(
  component: string,
  options: { dir: string; overwrite: boolean }
) {
  const examplePath = ADD_SOURCES[component];
  if (!examplePath) {
    console.error(chalk.red(`Unknown component "${component}".`));
    console.log(
      chalk.yellow(
        `Available: ${Object.keys(ADD_SOURCES).join(', ')}`
      )
    );
    process.exitCode = 1;
    return;
  }

  const repoUrl = 'https://github.com/smakosh/roll-your-own-auth.git';
  const tempDirectory = `.ryo-auth_temp`;

  try {
    console.log(
      chalk.yellow(`Fetching ${component} from ${examplePath}...`)
    );
    await execAsync(`rm -rf ${tempDirectory}`);
    await execAsync(`git clone --no-checkout ${repoUrl} ${tempDirectory}`);
    await execAsync(
      `cd ${tempDirectory} && git sparse-checkout init --cone`
    );
    await execAsync(
      `cd ${tempDirectory} && git sparse-checkout set ${examplePath}/src`
    );
    await execAsync(`cd ${tempDirectory} && git checkout`);

    const sourceDir = `${tempDirectory}/${examplePath}/src`;
    const targetDir = options.dir;

    const { stdout } = await execAsync(
      `cd ${sourceDir} && find . -type f`
    );
    const files = stdout.split('\n').map((f) => f.trim()).filter(Boolean);

    let written = 0;
    let skipped = 0;
    for (const rel of files) {
      const from = `${sourceDir}/${rel}`;
      const to = `${targetDir}/${rel.replace(/^\.\//, '')}`;
      const exists = existsSync(to);
      if (exists && !options.overwrite) {
        console.log(chalk.gray(`  skip (exists) ${to}`));
        skipped++;
        continue;
      }
      await mkdir(dirname(to), { recursive: true });
      await copyFile(from, to);
      console.log(chalk.green(`  + ${to}`));
      written++;
    }

    await execAsync(`rm -rf ${tempDirectory}`);
    console.log(
      chalk.green(
        `\nDone. Added ${written} file${written === 1 ? '' : 's'}` +
          (skipped ? `, skipped ${skipped} existing.` : '.')
      )
    );
    console.log(
      chalk.yellow(
        `\nInstall the example's dependencies (see examples/${examplePath
          .split('/')
          .pop()}/package.json for the full list).`
      )
    );
  } catch (error) {
    await execAsync(`rm -rf ${tempDirectory}`).catch(() => {});
    if (error instanceof Error) {
      console.error(chalk.red(`Error adding component: ${error.message}`));
    } else {
      console.error(chalk.red('An unknown error occurred.'));
    }
    process.exitCode = 1;
  }
}

const program = new Command();

program
  .command('init')
  .description('Initialize a new authentication setup')
  .action(() => {
    console.log(chalk.green('Starting the ryo-auth initialization process...'));
    initQuestions();
  });

program
  .command('add')
  .description('Add auth code from an example into your project (shadcn style)')
  .argument('[component]', 'component to add, e.g. session-express-prisma')
  .option('-d, --dir <dir>', 'target directory to copy files into', 'src')
  .option('-o, --overwrite', 'overwrite existing files', false)
  .action(async (component: string | undefined, options: { dir: string; overwrite: boolean }) => {
    if (!component) {
      console.log(chalk.yellow('Available components:'));
      for (const [name, path] of Object.entries(ADD_SOURCES)) {
        console.log(`  ${chalk.cyan(name)}  ${chalk.gray(`→ ${path}`)}`);
      }
      console.log(chalk.gray('\nUsage: ryo-auth add <component> [--dir src] [--overwrite]'));
      return;
    }
    await addComponent(component, options);
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
