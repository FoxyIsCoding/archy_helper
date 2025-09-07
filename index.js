import inquirer from 'inquirer';
import { exec, spawn } from 'child_process';
import ora from 'ora';

function execCommand(command, useSpawn = false, noSpinner = false) {
  if (!useSpawn) {
    // exec for regular commands, with optional spinner
    return new Promise((resolve, reject) => {
      let spinner;
      if (!noSpinner) spinner = ora(`Running: ${command}`).start();
      exec(command, (error, stdout, stderr) => {
        if (!noSpinner) spinner.stop();
        if (error) {
          console.error(`Exec error: ${error}`);
          reject(error);
          return;
        }
        console.log(stdout);
        resolve();
      });
    });
  } else {
    // spawn for sudo commands, no spinner so terminal shows password prompt
    return new Promise((resolve, reject) => {
      const parts = command.split(' ');
      const proc = spawn(parts[0], parts.slice(1), { stdio: 'inherit' });
      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Command failed with exit code ${code}`));
        } else {
          resolve();
        }
      });
    });
  }
}

async function installBasicApps() {
  const apps = [
    { name: 'vesktop', from: 'yay' },
    { name: 'spotify', from: 'yay' },
    { name: 'code', from: 'pacman' }, // VSCode

  ];

  for (const app of apps) {
    let command = '';
    let useSpawn = false;
    let noSpinner = false;
    if (app.from === 'pacman') {
      command = `sudo pacman -S ${app.name} --noconfirm`;
      useSpawn = true;
      noSpinner = true; 
    } else if (app.from === 'yay') {
      command = `yay -S ${app.name} --noconfirm`;
      useSpawn = true;
      noSpinner = true;
    }
    await execCommand(command, useSpawn, noSpinner);
  }
}

async function installDevApps() {
    const apps = [
      { name: 'vesktop', from: 'yay' },
      { name: 'spotify', from: 'yay' },
      { name: 'code', from: 'pacman' }, // VSCode
  
    ];
    
    for (const app of apps) {
        let command = '';
        let useSpawn = false;
        let noSpinner = false;
        if (app.from === 'pacman') {
          command = `sudo pacman -S ${app.name} --noconfirm`;
          useSpawn = true;
          noSpinner = true; 
        } else if (app.from === 'yay') {
          command = `yay -S ${app.name} --noconfirm`;
          useSpawn = true;
          noSpinner = true;
        }
        await execCommand(command, useSpawn, noSpinner);
      }
    }

async function run() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selection',
        message: 'Choose items:',
        choices: [
          "Basic apps (discord, spotify, vscode...)",
          "NodeJS",
          "Dev apps (python, git..)"
        ],
      },
    ]);

    for (const item of answers.selection) {
      try {
        const confirm = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: `Execute command for "${item}"?`,
            default: true,
          }
        ]);

        if (confirm.confirmed) {
          if (item === "Basic apps (discord, spotify, vscode...)") {
            await installBasicApps();
          } else if (item === "NodeJS") {
            await execCommand('curl -fsSL https://get.pnpm.io/install.sh | sh -');
            await execCommand('pnpm install express --save');
            await execCommand('pnpm i cors');
            await execCommand('pnpm i dotenv');
            await execCommand('pnpm i pm2 --save -g');
            await execCommand('pnpm i nodemon --save -D');
            await execCommand('pnpm i ts-node --save -D');
            await execCommand('pnpm i typescript --save -D');
            await execCommand('pnpm i dotenvx --save -D -g');
            await execCommand('pnpm install dotenv --save -g');
          } else if (item === "Dev apps (python, git..)") {
            await installDevApps();
          }
        }
      } catch (err) {
        if (err.name === 'ExitPromptError') {
          console.log('\nPrompt was closed. Skipping...');
          continue;
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    if (err.name === 'ExitPromptError') {
      console.log('\nPrompt was closed. Exiting program...');
    } else {
      console.error('Unexpected error:', err);
    }
  }
}

run();
