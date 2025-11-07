# SonarQube Setup Guide for GloBaPay

This guide explains how to set up SonarQube scanning with CircleCI to check for security hotspots and code smells.

## Prerequisites

1. **SonarCloud Account**: Sign up at [sonarcloud.io](https://sonarcloud.io) (free for open source projects)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **CircleCI Account**: Connect your GitHub repository to CircleCI

## Step 1: Set Up SonarCloud Project

1. Log in to [SonarCloud](https://sonarcloud.io)
2. Go to **"+"** → **"Analyze new project"**
3. Select your GitHub organization
4. Choose the **GloBaPay** repository
5. Copy the **Project Key** and **Organization Key** from SonarCloud
6. Update `sonar-project.properties` with your actual organization key:
   ```properties
   sonar.organization=your-actual-organization-key
   sonar.projectKey=your-actual-project-key
   ```

## Step 2: Generate SonarCloud Token

1. In SonarCloud, go to **My Account** → **Security**
2. Generate a new token (give it a name like "CircleCI")
3. **Copy the token** - you won't be able to see it again!

## Step 3: Configure CircleCI Context

1. In CircleCI, go to your project settings
2. Navigate to **Organizations** → **Settings** → **Contexts**
3. Create a new context named `sonarcloud` (or use existing)
4. Add an environment variable:
   - **Name**: `SONAR_TOKEN`
   - **Value**: Paste your SonarCloud token from Step 2

## Step 4: Update SonarQube Configuration

Update `sonar-project.properties` with your actual values:

```properties
sonar.projectKey=your-actual-project-key
sonar.organization=your-actual-organization-key
```

## Step 5: Push to GitHub and Trigger Pipeline

1. Commit and push your changes:
   ```bash
   git add .circleci/config.yml sonar-project.properties
   git commit -m "Configure SonarQube scanning for hotspots and code smells"
   git push origin main
   ```

2. CircleCI will automatically trigger the pipeline
3. The pipeline will:
   - Build frontend and backend
   - Run tests and generate coverage
   - Run SonarQube scan for security hotspots and code smells
   - Display results in CircleCI logs

## Step 6: View Results

1. **CircleCI Dashboard**: Check the `sonarqube-scan` job for scan status
2. **SonarCloud Dashboard**: View detailed analysis results including:
   - **Security Hotspots**: Potential security vulnerabilities that need review
   - **Code Smells**: Maintainability issues and code quality problems
   - **Bugs**: Reliability issues
   - **Coverage**: Test coverage metrics

## What Gets Scanned

The pipeline scans:
- **Frontend**: React/TypeScript code in `src/`
- **Backend**: Node.js/TypeScript code in `app_backend/src/`
- **Security Hotspots**: SQL injection, XSS, authentication issues, etc.
- **Code Smells**: Code duplication, complexity, maintainability issues
- **Test Coverage**: Both frontend and backend test coverage

## Pipeline Workflow

The CircleCI pipeline consists of three jobs:

1. **build-and-test**: Builds frontend and backend, runs tests, generates coverage
2. **sonarqube-scan**: Runs SonarQube analysis for hotspots and code smells
3. **security-scan**: Runs additional security audits

## Troubleshooting

### Issue: "SONAR_TOKEN not found"
- **Solution**: Ensure you've added `SONAR_TOKEN` to the CircleCI context named `sonarcloud`

### Issue: "Organization not found"
- **Solution**: Check that your `sonar.organization` in `sonar-project.properties` matches your SonarCloud organization key

### Issue: "Project key mismatch"
- **Solution**: Verify the `sonar.projectKey` in `sonar-project.properties` matches your SonarCloud project key

### Issue: Coverage reports not found
- **Solution**: Ensure tests are configured to generate coverage reports. The pipeline expects `coverage/lcov.info` files.

## Quality Gate

The pipeline is configured with `sonar.qualitygate.wait=true`, which means:
- The build will fail if the code doesn't meet the quality gate criteria
- You can adjust quality gate rules in SonarCloud dashboard

## Security Hotspots vs Vulnerabilities

- **Security Hotspots**: Require manual review to determine if they're actual vulnerabilities
- **Vulnerabilities**: Confirmed security issues that need to be fixed

## Code Smells Categories

SonarQube detects various code smells:
- **Blocker**: Critical issues that should be addressed immediately
- **Critical**: Important issues that should be fixed soon
- **Major**: Significant issues that should be addressed
- **Minor**: Less critical issues
- **Info**: Informational messages

## Next Steps

1. Review security hotspots in SonarCloud dashboard
2. Address code smells to improve maintainability
3. Set up quality gate rules appropriate for your project
4. Configure branch analysis for pull requests
5. Set up notifications for new issues

## Resources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [CircleCI SonarCloud Orb](https://circleci.com/developer/orbs/orb/sonarsource/sonarcloud)
- [SonarQube Quality Gates](https://docs.sonarcloud.io/user-guide/quality-gates/)

