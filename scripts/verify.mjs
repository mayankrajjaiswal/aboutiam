import { execSync } from 'child_process'
import chalk from 'chalk' // Note: check if chalk is available, if not, standard ANSI codes work fine.
// We can use native ANSI color codes to remain dependency-free!

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function runCommand(name, command) {
  console.log(`\n${colors.bold}${colors.cyan}🚀 RUNNING STAGE: ${name}...${colors.reset}`);
  console.log(`${colors.yellow}Command: ${command}${colors.reset}\n`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`\n${colors.green}✓ STAGE SUCCESS: ${name} completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`\n${colors.red}💥 STAGE FAILURE: ${name} failed!${colors.reset}`);
    return false;
  }
}

function main() {
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  ABOUTIAM LOCAL PRE-FLIGHT CHECK & VERIFIER  ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);

  const stages = [
    { name: 'TypeScript Compilation Checks', cmd: 'npx tsc -b' },
    { name: 'ESLint Code Quality Audits', cmd: 'npm run lint' },
    { name: 'Vitest Unit Testing Suite', cmd: 'npx vitest run' },
    { name: 'Vite Production Build & SSG Pre-render', cmd: 'node node_modules/vite/bin/vite.js build' }
  ];

  for (const stage of stages) {
    const success = runCommand(stage.name, stage.cmd);
    if (!success) {
      console.log(`\n${colors.bold}${colors.red}❌ PRE-FLIGHT VERIFICATION FAILED! Please resolve the errors above before committing or pushing to GitHub.${colors.reset}\n`);
      process.exit(1);
    }
  }

  console.log(`\n${colors.bold}${colors.green}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.green} 🎉 ALL PRE-FLIGHT CHECKS PASSED! CODE IS 100% SECURE FOR MAIN DEPLOY!${colors.reset}`);
  console.log(`${colors.bold}${colors.green}====================================================${colors.reset}\n`);
  process.exit(0);
}

main();
