import inquirer from 'inquirer';
import chalk from 'chalk';
import { FileSystemServer } from './mcp/filesystem-server.js';
import { InterviewerAgent } from './agents/interviewer.js';
import { EvaluatorAgent } from './agents/evaluator.js';

export class Orchestrator {
  constructor(targetDir, apiKey) {
    this.targetDir = targetDir;
    this.mcp = new FileSystemServer(targetDir);
    this.interviewer = new InterviewerAgent(apiKey);
    this.evaluator = new EvaluatorAgent(apiKey);
    this.history = [];
    this.codeContext = "";
  }

  async run(turns = 3) {
    console.log(chalk.blue.bold(`\nInitializing Mock-Viva Assistant for project at: ${this.targetDir}\n`));
    
    // Phase 1: Context Initialization
    await this.mcp.connect();
    console.log(chalk.gray("Scanning project directory..."));
    
    // Simplistic context gathering for scaffolding purposes
    // Real implementation would recursively read specific files (.js, .json)
    const rootFiles = await this.mcp.listDirectory('');
    
    let contextBuilder = [];
    for (const file of rootFiles) {
        if (file.type === 'file' && (file.name.endsWith('.json') || file.name.endsWith('.js'))) {
            try {
                const content = await this.mcp.readFile(file.path);
                contextBuilder.push(`--- FILE: ${file.path} ---\n${content.substring(0, 1000)}\n...`);
            } catch (e) {
                // Ignore read errors for individual files
            }
        }
    }
    
    this.codeContext = contextBuilder.join('\n\n');
    console.log(chalk.green(`Successfully gathered code context. Found ${rootFiles.length} root entries.\n`));

    // Phase 2 to 5: Main Loop
    for (let i = 0; i < turns; i++) {
        console.log(chalk.yellow.bold(`=== Turn ${i + 1} of ${turns} ===\n`));
        
        // Phase 2: Analysis & Question
        console.log(chalk.gray("Interviewer is analyzing the code and preparing a question..."));
        const interviewData = await this.interviewer.generateQuestion(this.codeContext, this.history);
        
        console.log(chalk.cyan.bold("\nInterviewer:") + chalk.cyan(` ${interviewData.question}`));
        console.log(chalk.gray(`[Referencing: ${interviewData.contextReferenced}]\n`));

        // Phase 3: User Interaction
        const { answer } = await inquirer.prompt([
            {
                type: 'input',
                name: 'answer',
                message: 'Your answer (type "exit" to quit):'
            }
        ]);

        if (answer.trim().toLowerCase() === 'exit') {
            console.log(chalk.red("Exiting mock-viva session early."));
            break;
        }

        // Phase 4: Evaluation
        console.log(chalk.gray("\nEvaluator is grading your response..."));
        const evaluation = await this.evaluator.evaluateResponse(this.codeContext, interviewData.question, answer);
        
        console.log(chalk.magenta.bold("\nEvaluator Feedback:"));
        console.log(chalk.white(`Score: `) + chalk.bold(evaluation.score >= 7 ? chalk.green(evaluation.score) : chalk.red(evaluation.score)) + `/10`);
        console.log(chalk.white(`Pass:  `) + (evaluation.isPass ? chalk.green('Yes') : chalk.red('No')));
        console.log(chalk.white(`Feedback: `) + chalk.italic(evaluation.feedback));
        
        if (evaluation.missedPoints && evaluation.missedPoints.length > 0) {
            console.log(chalk.white(`Missed Points:`));
            evaluation.missedPoints.forEach(point => {
                console.log(chalk.yellow(` - ${point}`));
            });
        }
        console.log("\n" + "=".repeat(40) + "\n");

        // Update history
        this.history.push({ question: interviewData.question, answer });
    }

    console.log(chalk.green.bold("Mock-Viva Session Complete. Great job!\n"));
    await this.mcp.disconnect();
  }
}
