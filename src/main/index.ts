import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as fs from 'fs'
import * as os from 'os'
import { exec } from 'child_process'
import { Client } from 'ssh2'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (canceled) return null
    return filePaths[0]
  })

  ipcMain.handle('run-php', async (_, { code, projectPath }) => {
    return new Promise((resolve) => {
      const tempFile = join(os.tmpdir(), `tinkerclone_${Date.now()}.php`)

      let finalCode = code

      // Strip leading <?php tag from user code since we add our own
      const userCode = code.trim().replace(/^<\?php\s*/i, '').replace(/^\?>\s*/i, '')

      if (projectPath) {
        const autoloadPath = join(projectPath, 'vendor', 'autoload.php').replace(/\\/g, '/')
        const bootstrapPath = join(projectPath, 'bootstrap', 'app.php').replace(/\\/g, '/')

        let setupCode = `<?php\n`

        if (fs.existsSync(autoloadPath)) {
          setupCode += `require_once '${autoloadPath}';\n`
        }

        if (fs.existsSync(bootstrapPath)) {
          setupCode += `$__app = require_once '${bootstrapPath}';\n`
          setupCode += `$__kernel = $__app->make(Illuminate\\Contracts\\Console\\Kernel::class);\n`
          setupCode += `$__kernel->bootstrap();\n`
        }

        setupCode += `\n`
        setupCode += `// ----- User Code -----\n`
        setupCode += `ob_start();\n`
        setupCode += `$__tinker_result = null;\n`
        setupCode += `try {\n`
        setupCode += `${userCode}\n`
        setupCode += `} catch (\\Throwable $__e) {\n`
        setupCode += `  echo "Fatal Error: " . $__e->getMessage() . "\\n";\n`
        setupCode += `  echo "In " . $__e->getFile() . " on line " . $__e->getLine() . "\\n";\n`
        setupCode += `}\n`
        setupCode += `$__output = ob_get_clean();\n`
        setupCode += `echo $__output;\n`

        finalCode = setupCode
      } else {
        let setupCode = `<?php\n`
        setupCode += `ob_start();\n`
        setupCode += `try {\n`
        setupCode += `${userCode}\n`
        setupCode += `} catch (\\Throwable $__e) {\n`
        setupCode += `  echo "Fatal Error: " . $__e->getMessage() . "\\n";\n`
        setupCode += `  echo "In " . $__e->getFile() . " on line " . $__e->getLine() . "\\n";\n`
        setupCode += `}\n`
        setupCode += `$__output = ob_get_clean();\n`
        setupCode += `echo $__output;\n`
        finalCode = setupCode
      }

      fs.writeFileSync(tempFile, finalCode)

      const execOptions = projectPath ? { cwd: projectPath } : {}

      exec(`php "${tempFile}"`, execOptions, (error, stdout, stderr) => {
        try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile) } catch (e) { }

        if (error) {
          resolve(stderr || error.message)
          return
        }
        resolve(stdout || stderr)
      })
    })
  })

  // Basic SSH execution handler
  ipcMain.handle('run-php-ssh', async (_, { code, sshConfig }) => {
    return new Promise((resolve) => {
      const conn = new Client()
      conn.on('ready', () => {
        // Create a random filename for the temp script
        const remoteScript = `/tmp/tinkerclone_${Date.now()}.php`

        // Write the PHP code to the remote server using echo or cat
        // To handle quotes safely, base64 encode the code locally and decode remotely
        const base64Code = Buffer.from(code).toString('base64')
        const command = `echo "${base64Code}" | base64 -d > ${remoteScript} && php ${remoteScript}; rm ${remoteScript}`

        conn.exec(command, (err: any, stream: any) => {
          if (err) {
            conn.end()
            return resolve(`SSH Execution Error: ${err.message}`)
          }
          let output = ''
          stream.on('close', () => {
            conn.end()
            resolve(output)
          }).on('data', (data: any) => {
            output += data.toString()
          }).stderr.on('data', (data: any) => {
            output += data.toString()
          })
        })
      }).on('error', (err: any) => {
        resolve(`SSH Connection Error: ${err.message}`)
      }).connect({
        host: sshConfig.host,
        port: parseInt(sshConfig.port) || 22,
        username: sshConfig.username,
        password: sshConfig.password
      })
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
