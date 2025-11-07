# GitHub Repository & CircleCI Setup Guide

This guide helps you set up your GitHub repository with CircleCI for automated SonarQube scanning.

## Step 1: Initialize GitHub Repository (if not already done)

### Option A: New Repository
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: GloBaPay Payment Portal"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/your-username/globapay.git

# Push to GitHub
git push -u origin main
```

### Option B: Existing Repository
```bash
# Verify remote is set
git remote -v

# If not set, add it
git remote add origin https://github.com/your-username/globapay.git

# Push to GitHub
git push -u origin main
```

## Step 2: Connect Repository to CircleCI

1. **Sign in to CircleCI**:
   - Go to [circleci.com](https://circleci.com)
   - Sign in with your GitHub account

2. **Add Project**:
   - Click **"Add Projects"** in the sidebar
   - Find your **GloBaPay** repository
   - Click **"Set Up Project"**

3. **Select Configuration**:
   - Choose **"Use an existing config"**
   - Branch: `main` (or `master`)
   - CircleCI will detect `.circleci/config.yml`

4. **Start Building**:
   - Click **"Start Building"**
   - Your first pipeline will start

## Step 3: Configure CircleCI Context for SonarQube

1. **Create Context**:
   - In CircleCI, go to **Organizations** → **Settings** → **Contexts**
   - Click **"Create Context"**
   - Name it: `sonarcloud`
   - Add it to your organization

2. **Add Environment Variables**:
   - Click on the `sonarcloud` context
   - Click **"Add Environment Variable"**
   - Add:
     - **Name**: `SONAR_TOKEN`
     - **Value**: Your SonarCloud token (see SONARQUBE_SETUP.md)

3. **Security**:
   - Add the contexts to your project's security settings
   - Ensure only authorized members can access

## Step 4: Set Up SonarCloud (See SONARQUBE_SETUP.md)

Follow the detailed guide in `SONARQUBE_SETUP.md` to:
- Create SonarCloud account
- Generate project and organization keys
- Get authentication token
- Update `sonar-project.properties`

## Step 5: Update Configuration Files

1. **Update `sonar-project.properties`**:
   ```properties
   sonar.projectKey=your-actual-project-key
   sonar.organization=your-actual-organization-key
   ```

2. **Commit and Push**:
   ```bash
   git add sonar-project.properties .circleci/config.yml
   git commit -m "Configure SonarQube scanning with CircleCI"
   git push origin main
   ```

## Step 6: Verify Pipeline Runs

1. **Check CircleCI Dashboard**:
   - Go to your project in CircleCI
   - You should see the pipeline running
   - Check the `build-and-test` job first
   - Then `sonarqube-scan` job

2. **Check SonarCloud Dashboard**:
   - Go to [sonarcloud.io](https://sonarcloud.io)
   - Navigate to your project
   - You should see analysis results with:
     - Security Hotspots
     - Code Smells
     - Bugs
     - Coverage

## Pipeline Workflow

The CircleCI pipeline runs automatically on:
- **Push to main/master branch**
- **Pull requests** (if configured)

### Jobs in Pipeline:

1. **build-and-test**:
   - Installs dependencies (frontend & backend)
   - Builds both frontend and backend
   - Runs tests
   - Generates coverage reports
   - Runs npm audit

2. **sonarqube-scan**:
   - Runs SonarQube analysis
   - Checks for security hotspots
   - Detects code smells
   - Analyzes code quality
   - Reports coverage

3. **security-scan**:
   - Runs additional security audits
   - OWASP dependency checks

## Branch Protection (Recommended)

Set up branch protection in GitHub:

1. Go to repository **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select: `build-and-test` and `sonarqube-scan`
   - ✅ Require pull request reviews before merging

## Troubleshooting

### Pipeline Not Triggering
- **Check**: Is CircleCI connected to the repository?
- **Check**: Is `.circleci/config.yml` in the repository?
- **Check**: Are you pushing to the correct branch?

### Build Failing
- **Check**: CircleCI logs for error messages
- **Check**: Node version compatibility
- **Check**: Dependencies are properly installed

### SonarQube Scan Failing
- **Check**: `SONAR_TOKEN` is set in CircleCI context
- **Check**: `sonar-project.properties` has correct keys
- **Check**: Project exists in SonarCloud

### Coverage Not Showing
- **Check**: Tests are generating coverage reports
- **Check**: Coverage files are in the correct location
- **Check**: Coverage paths in `sonar-project.properties`

## Next Steps

1. ✅ Repository is on GitHub
2. ✅ CircleCI is connected
3. ✅ SonarQube is configured
4. ✅ Pipeline is running
5. 📊 Review security hotspots and code smells
6. 🔧 Fix issues found in SonarQube
7. 📈 Monitor code quality over time

## Resources

- [CircleCI Documentation](https://circleci.com/docs/)
- [GitHub Repository Setup](https://docs.github.com/en/repositories/creating-and-managing-repositories)
- [SonarCloud Integration](https://docs.sonarcloud.io/integrations/circleci/)

