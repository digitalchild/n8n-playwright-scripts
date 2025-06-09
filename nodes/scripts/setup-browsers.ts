import { mkdirSync, existsSync, readdirSync, rmSync, cpSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import { platform, homedir } from 'os';
import { BrowserType } from '../playwright/config';

const LOCAL_BROWSER_PATH = resolve(homedir(), '.n8n', 'nodes', 'node_modules', 'n8n-nodes-playwright', 'dist', 'nodes', 'browsers');

function getCandidateBrowserPaths(): string[] {
	const home = homedir();
	const paths: string[] = [];

	if (platform() === 'win32') {
		const userprofile = process.env.USERPROFILE;
		if (userprofile) {
			paths.push(join(userprofile, 'AppData', 'Local', 'ms-playwright'));
		}
	} else if (platform() === 'darwin') {
		paths.push(join(home, 'Library', 'Caches', 'ms-playwright'));
	}
	paths.push(join(home, '.cache', 'ms-playwright'));

	return paths;
}

async function setupBrowsers() {
	try {
		console.log('Starting browser setup...\n');

		// 1. Environment info
		console.log('Current working directory:', process.cwd());
		console.log('Operating System:', platform());
		console.log('Node version:', process.version);

		// 2. Locate source cache path
		let sourcePath: string | undefined;
		for (const candidate of getCandidateBrowserPaths()) {
			if (existsSync(candidate)) {
				sourcePath = candidate;
				break;
			}
		}

		if (!sourcePath) {
			console.log('\nNo existing browser cache found. Installing all Playwright browsers...');
			execSync('npx --yes playwright install', { stdio: 'inherit' });

			// retry detection
			for (const candidate of getCandidateBrowserPaths()) {
				if (existsSync(candidate)) {
					sourcePath = candidate;
					break;
				}
			}
		}

		if (!sourcePath) {
			throw new Error('Could not find browser cache after install.');
		}

		console.log('\nPaths:');
		console.log('Source path:', sourcePath);
		console.log('Destination path:', LOCAL_BROWSER_PATH);

		// 3. Clean destination
		if (existsSync(LOCAL_BROWSER_PATH)) {
			console.log('\nCleaning existing browsers directory...');
			rmSync(LOCAL_BROWSER_PATH, { recursive: true, force: true });
		}

		// 4. Create destination
		console.log('Creating browsers directory...');
		mkdirSync(LOCAL_BROWSER_PATH, { recursive: true });

		// 5. Copy browser folders
		console.log('\nCopying browser files...');
		const files = readdirSync(sourcePath);
		for (const file of files) {
			if (/^(chromium-|firefox-|webkit)/.test(file)) {
				const sourceFull = join(sourcePath, file);
				const destFull = join(LOCAL_BROWSER_PATH, file);

				if (statSync(sourceFull).isDirectory()) {
					console.log(`Copying ${file}...`);
					cpSync(sourceFull, destFull, { recursive: true });
				}
			}
		}

		// 6. Verify installation
		console.log('\nVerifying installation...');
		const installedFiles = readdirSync(LOCAL_BROWSER_PATH);
		console.log('Installed browsers:', installedFiles);

		const expectedBrowsers: BrowserType[] = ['chromium', 'firefox', 'webkit'];

		for (const browserType of expectedBrowsers) {
			const match = installedFiles.find(f => f.startsWith(browserType));
			if (!match) {
				console.log(`\nMissing ${browserType}. Installing...`);
				await installBrowser(browserType);
			}
		}

		console.log('\n✅ Browser setup completed successfully!');
	} catch (error) {
		console.error('\n❌ Error during browser setup:', error);
		process.exit(1);
	}
}

export async function installBrowser(browserType: BrowserType) {
	try {
		console.log(`Installing ${browserType}...`);

		execSync(`npx --yes playwright install ${browserType}`, {
			env: {
				...process.env,
				PLAYWRIGHT_BROWSERS_PATH: LOCAL_BROWSER_PATH,
			},
			stdio: 'inherit',
		});
	} catch (error) {
		console.error(`Failed to install ${browserType}:`, error);
	}
}

// Only run setup if executed directly
if (require.main === module) {
	setupBrowsers().catch(error => {
		console.error('Unhandled error:', error);
		process.exit(1);
	});
}
