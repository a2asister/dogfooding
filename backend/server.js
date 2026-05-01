const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dataStore = {
  users: require('./data/users.json'),
  codeRepos: require('./data/codeRepos.json'),
  apiDocs: require('./data/apiDocs.json'),
  designResources: require('./data/designResources.json'),
  testCases: require('./data/testCases.json'),
  deploymentRecords: require('./data/deploymentRecords.json'),
  permissions: require('./data/permissions.json'),
  gitIntegrations: require('./data/gitIntegrations.json'),
  cicdPipelines: require('./data/cicdPipelines.json'),
  cloudServices: require('./data/cloudServices.json'),
  assetLedger: require('./data/assetLedger.json')
};

const { authenticateToken, checkPermission } = require('./middleware/auth');

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RMS Backend is running' });
});

const userRoutes = require('./routes/users');
const codeRepoRoutes = require('./routes/codeRepos');
const apiDocRoutes = require('./routes/apiDocs');
const designResourceRoutes = require('./routes/designResources');
const testCaseRoutes = require('./routes/testCases');
const deploymentRoutes = require('./routes/deployments');
const permissionRoutes = require('./routes/permissions');
const gitIntegrationRoutes = require('./routes/gitIntegrations');
const cicdRoutes = require('./routes/cicdPipelines');
const cloudRoutes = require('./routes/cloudServices');
const ledgerRoutes = require('./routes/assetLedger');
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/code-repos', authenticateToken, codeRepoRoutes);
app.use('/api/api-docs', authenticateToken, apiDocRoutes);
app.use('/api/design-resources', authenticateToken, designResourceRoutes);
app.use('/api/test-cases', authenticateToken, testCaseRoutes);
app.use('/api/deployments', authenticateToken, deploymentRoutes);
app.use('/api/permissions', authenticateToken, permissionRoutes);
app.use('/api/git-integrations', authenticateToken, gitIntegrationRoutes);
app.use('/api/cicd', authenticateToken, cicdRoutes);
app.use('/api/cloud-services', authenticateToken, cloudRoutes);
app.use('/api/asset-ledger', authenticateToken, ledgerRoutes);

app.listen(PORT, () => {
  console.log(`RMS Backend server is running on port ${PORT}`);
});
