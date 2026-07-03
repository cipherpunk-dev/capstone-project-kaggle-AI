import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Connects to a standard MCP filesystem server or implements a lightweight mock
 * for reading local project files securely.
 */
export class FileSystemServer {
  constructor(targetDir) {
    this.targetDir = path.resolve(targetDir);
    this.client = null;
    this.transport = null;
  }

  async connect() {
    // In a full production setup, this would spawn `npx -y @modelcontextprotocol/server-filesystem`
    // For this scaffold, we'll configure the abstract MCP client but provide direct local fallbacks 
    // to keep the CLI self-contained without needing global npx installs if possible.
    
    // Example MCP transport setup:
    /*
    this.transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", this.targetDir]
    });
    this.client = new Client({ name: "mock-viva-cli", version: "1.0.0" }, { capabilities: {} });
    await this.client.connect(this.transport);
    */
    
    // Simulating successful connection to local directory scope
    await fs.access(this.targetDir).catch(() => {
        throw new Error(`Cannot access target directory: ${this.targetDir}`);
    });
  }

  async disconnect() {
    if (this.transport) {
      await this.transport.close();
    }
  }

  async listDirectory(dirPath = '') {
    const fullPath = path.join(this.targetDir, dirPath);
    // Security Guardrail: Prevent path traversal
    if (!fullPath.startsWith(this.targetDir)) {
      throw new Error("Path traversal is strictly prohibited.");
    }

    try {
        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        return entries
            .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
            .map(e => ({ name: e.name, type: e.isDirectory() ? 'directory' : 'file', path: path.join(dirPath, e.name) }));
    } catch (e) {
        return [];
    }
  }

  async readFile(filePath) {
    const fullPath = path.join(this.targetDir, filePath);
    // Security Guardrail: Prevent path traversal
    if (!fullPath.startsWith(this.targetDir)) {
      throw new Error("Path traversal is strictly prohibited.");
    }
    
    try {
        const content = await fs.readFile(fullPath, 'utf8');
        return content;
    } catch (e) {
        throw new Error(`Failed to read file ${filePath}: ${e.message}`);
    }
  }
}
