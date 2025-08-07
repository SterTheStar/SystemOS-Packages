#!/usr/bin/env node

/**
 * SystemOS Repository Server
 * Simple static file server for SystemOS packages
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

class RepositoryServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.repoPath = path.join(__dirname, 'repository');
        this.packagesPath = path.join(this.repoPath, 'packages');
        
        this.setupMiddleware();
        this.setupRoutes();
        this.ensureDirectories();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(compression());

        // Body parsing
        this.app.use(express.json());

        // Static files for packages
        this.app.use('/packages', express.static(this.packagesPath));

        // Logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }

    setupRoutes() {
        // Repository info
        this.app.get('/', (req, res) => {
            res.json({
                name: 'SystemOS Package Repository',
                version: '1.0.0',
                description: 'SystemOS package repository server',
                endpoints: {
                    packages: '/packages.json',
                    download: '/packages/:packageName/:filename'
                }
            });
        });

        // Get packages list
        this.app.get('/packages.json', (req, res) => {
            try {
                const packagesFile = path.join(this.repoPath, 'packages.json');
                if (!fs.existsSync(packagesFile)) {
                    return res.json({
                        repository: {
                            name: 'SystemOS Official Repository',
                            version: '1.0.0',
                            url: `http://localhost:${this.port}`,
                            description: 'Official SystemOS package repository'
                        },
                        packages: [],
                        lastUpdated: new Date().toISOString()
                    });
                }

                const packages = JSON.parse(fs.readFileSync(packagesFile, 'utf8'));
                res.json(packages);
            } catch (error) {
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // Download package files
        this.app.get('/packages/:packageName/:filename', (req, res) => {
            try {
                const packageName = req.params.packageName;
                const filename = req.params.filename;
                const filePath = path.join(this.packagesPath, packageName, filename);

                if (!fs.existsSync(filePath)) {
                    return res.status(404).json({
                        error: 'File not found'
                    });
                }

                // Set appropriate headers
                if (filename.endsWith('.syos')) {
                    res.setHeader('Content-Type', 'application/octet-stream');
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                } else if (filename.endsWith('.syfo')) {
                    res.setHeader('Content-Type', 'application/json');
                }

                res.sendFile(filePath);
            } catch (error) {
                res.status(500).json({
                    error: error.message
                });
            }
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found'
            });
        });

        // Error handler
        this.app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
    }

    ensureDirectories() {
        const dirs = [this.repoPath, this.packagesPath];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Create packages.json if it doesn't exist
        const packagesFile = path.join(this.repoPath, 'packages.json');
        if (!fs.existsSync(packagesFile)) {
            const initialData = {
                repository: {
                    name: 'SystemOS Official Repository',
                    version: '1.0.0',
                    url: `http://localhost:${this.port}`,
                    description: 'Official SystemOS package repository',
                    maintainer: 'SystemOS Development Team'
                },
                packages: [],
                lastUpdated: new Date().toISOString()
            };

            fs.writeFileSync(packagesFile, JSON.stringify(initialData, null, 2));
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 SystemOS Repository Server running on port ${this.port}`);
            console.log(`📦 Repository path: ${this.repoPath}`);
            console.log(`🌐 Packages list: http://localhost:${this.port}/packages.json`);
            console.log(`📋 Health check: http://localhost:${this.port}/health`);
        });
    }
}

// Start server if run directly
if (require.main === module) {
    const server = new RepositoryServer();
    server.start();
}

module.exports = RepositoryServer;