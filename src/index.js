import { Command } from 'commander';
import { Orchestrator } from './orchestrator.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('mock-viva')
  .description('A CLI to conduct a mock-viva and code-review using Gemini AI')
  .version('1.0.0');

program
  .command('start')
  .description('Start a mock-viva session')
  .requiredOption('-d, --dir <path>', 'Path to the local Node.js project directory to analyze')
  .option('-t, --turns <number>', 'Number of question turns', '3')
  .action(async (options) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error(chalk.red.bold("Error: GEMINI_API_KEY environment variable is missing."));
        console.log("Please export your Gemini API key before running the CLI.");
        process.exit(1);
    }

    try {
        const orchestrator = new Orchestrator(options.dir, apiKey);
        await orchestrator.run(parseInt(options.turns, 10));
    } catch (err) {
        console.error(chalk.red("A fatal error occurred:"), err.message);
        process.exit(1);
    }
  });

program.parse();
