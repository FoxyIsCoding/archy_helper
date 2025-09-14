import inquirer from 'inquirer';
import { exec, spawn } from 'child_process';
import ora from 'ora';
import fs from 'fs';
import path from 'path';


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
    { name: 'kdeconnect', from: 'yay' },
    { name: 'firefox', from: 'yay'}

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
      { name: 'cursor-bin', from: 'yay' },
      { name: 'git', from: 'yay' },
      { name: 'python', from: 'yay' },  
      { name: 'pip', from: 'yay' },
      { name: 'nodejs', from: 'yay' },
      { name: 'docker', from: 'pacman' },
      { name: 'docker-compose', from: 'pacman' }, 
      { name: 'tailscale', from: 'yay' },
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

            await execCommand('mkdir -p ~/.local/share/AppImage');
            
  
            await execCommand('wget -O ~/.local/share/AppImage/linux-hayase-6.4.26-linux.AppImage "https://github.com/hayase-app/ui/releases/download/v6.4.26/linux-hayase-6.4.26-linux.AppImage"');
            

            await execCommand('chmod a+x ~/.local/share/AppImage/linux-hayase-6.4.26-linux.AppImage');

            // await execCommand('~/.local/share/AppImage/linux-hayase-6.4.26-linux.AppImage');
            
       
            const desktopFileContent = `
[Desktop Entry]
Name=Hayase
Exec=/home/${process.env.USER}/.local/share/AppImage/linux-hayase-6.4.26-linux.AppImage
Icon=/home/${process.env.USER}/.local/share/icons/hayase.png
Type=Application
Categories=Audio;Music;
StartupNotify=true
Terminal=false
            `;
            

            const desktopFilePath = path.join(process.env.HOME, '.local/share/applications/hayase.desktop');
            
            // Write the .desktop file
            fs.writeFileSync(desktopFilePath, desktopFileContent);
            
            // Update the desktop database
            await execCommand('update-desktop-database ~/.local/share/applications/');
            
            // Optional: Download icon for the app (replace with actual icon URL if available)
            await execCommand('wget -O ~/.local/share/icons/hayase.png "https://github.com/hayase-app/ui/raw/master/static/logo_white.svg"');
            //

            // Add shell aliases for launching Hayase
            const hayaseDesktopPath = path.join(process.env.HOME, '.local/share/applications/hayase.desktop');
            const hayaseAppImagePath = `/home/${process.env.USER}/.local/share/AppImage/linux-hayase-6.4.26-linux.AppImage`;

            // Bash alias
            const bashrcPath = path.join(process.env.HOME, '.bashrc');
            const bashAlias = `\nalias anime='${hayaseAppImagePath}'\nalias hayase='${hayaseAppImagePath}'\n`;
            try {
              fs.appendFileSync(bashrcPath, bashAlias);
              console.log('Added anime and hayase aliases to .bashrc');
            } catch (err) {
              console.error('Failed to add bash aliases:', err);
            }

            // Fish alias
            const fishConfigDir = path.join(process.env.HOME, '.config/fish');
            const fishConfigPath = path.join(fishConfigDir, 'config.fish');
            const fishAlias = `\nalias anime '${hayaseAppImagePath}'\nalias hayase '${hayaseAppImagePath}'\n`;
            try {
              fs.appendFileSync(fishConfigPath, fishAlias);
              console.log('Added anime and hayase aliases to config.fish');
            } catch (err) {
              console.error('Failed to add fish aliases:', err);
            }
            await installBasicApps();
            await execCommand('flatpak install flathub com.belmoussaoui.Authenticator -y');
            await execCommand('flatpak install flathub de.haeckerfelix.Fragments -y');
            await execCommand('flatpak install flathub io.gitlab.adhami3310.Impression -y');
            await execCommand('curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh');
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
