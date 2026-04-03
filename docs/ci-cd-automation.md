# CI/CD Automation Guide for attest

This guide explains how to automatically create AI attestations in your continuous integration and deployment pipelines.

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Platform-Specific Guides](#platform-specific-guides)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Integrating attest into your CI/CD pipeline allows you to:
- Automatically document AI involvement in code generation
- Create attestations for every build or release
- Add badges to documentation automatically
- Maintain transparency about AI usage in your project
- Generate audit trails for compliance

## Quick Start

The simplest way to create an attestation in any CI/CD system:

```bash
# Basic attestation creation
curl -s "https://attest.97115104.com/api/create.html?content_name=MyProject&model=github-copilot&role=assisted&output=json" > attestation.json

# With content hash
CONTENT_HASH=$(sha256sum myfile.js | cut -d' ' -f1)
curl -s "https://attest.97115104.com/api/create.html?content_name=myfile.js&content_hash=sha256:$CONTENT_HASH&model=gpt-4&role=generated"
```

## Platform-Specific Guides

### GitHub Actions

Create `.github/workflows/attestation.yml`:

```yaml
name: Create AI Attestation
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  attest:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Create attestation for source code
      run: |
        # Calculate content hash for all JS files
        CONTENT=$(find . -name "*.js" -type f -exec cat {} \; | sha256sum | cut -d' ' -f1)
        
        # Create attestation
        RESPONSE=$(curl -s "https://attest.97115104.com/api/create.html" \
          --data-urlencode "content_name=${{ github.repository }}" \
          --data-urlencode "content_hash=sha256:$CONTENT" \
          --data-urlencode "model=github-copilot" \
          --data-urlencode "role=assisted" \
          --data-urlencode "author=${{ github.actor }}" \
          --data-urlencode "output=json")
        
        # Save attestation
        echo "$RESPONSE" > attestation.json
        
        # Extract badge URL and add to README
        DATA_URL=$(echo "$RESPONSE" | jq -r '.dataUrl')
        echo -e "\n\n[![AI Assisted](https://attest.97115104.com/assets/badges/ai-assisted.svg)]($DATA_URL)" >> README.md
    
    - name: Upload attestation
      uses: actions/upload-artifact@v3
      with:
        name: ai-attestation
        path: attestation.json
    
    - name: Commit badge to README
      if: github.event_name == 'push'
      run: |
        git config user.name "GitHub Actions"
        git config user.email "actions@github.com"
        git add README.md
        git diff --quiet && git diff --staged --quiet || git commit -m "Add AI attestation badge"
        git push
```

### GitLab CI/CD

Add to `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - attest
  - deploy

create-attestation:
  stage: attest
  image: alpine:latest
  before_script:
    - apk add --no-cache curl jq
  script:
    # Create attestation for the entire project
    - |
      ATTESTATION=$(curl -s -X POST "https://attest.97115104.com/api/create.html" \
        -d "content_name=$CI_PROJECT_NAME" \
        -d "model=claude-3-opus" \
        -d "role=assisted" \
        -d "author=$GITLAB_USER_NAME" \
        -d "output=json")
    
    # Save attestation
    - echo "$ATTESTATION" > attestation.json
    
    # Create badge file
    - |
      DATA_URL=$(echo "$ATTESTATION" | jq -r '.dataUrl')
      echo "[![AI Assisted](https://attest.97115104.com/assets/badges/ai-assisted.svg)]($DATA_URL)" > badge.md
  
  artifacts:
    paths:
      - attestation.json
      - badge.md
    expire_in: 1 year
```

### Jenkins

Add to `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    environment {
        AI_MODEL = 'github-copilot'
        AI_ROLE = 'assisted'
    }
    
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Create AI Attestation') {
            steps {
                script {
                    // Calculate content hash
                    def contentHash = sh(
                        script: "find dist -name '*.js' -exec cat {} \\; | sha256sum | cut -d' ' -f1",
                        returnStdout: true
                    ).trim()
                    
                    // Create attestation
                    def response = sh(
                        script: """
                            curl -s 'https://attest.97115104.com/api/create.html' \
                                --data-urlencode 'content_name=${env.JOB_NAME}' \
                                --data-urlencode 'content_hash=sha256:${contentHash}' \
                                --data-urlencode 'model=${env.AI_MODEL}' \
                                --data-urlencode 'role=${env.AI_ROLE}' \
                                --data-urlencode 'author=${env.BUILD_USER}' \
                                --data-urlencode 'output=json'
                        """,
                        returnStdout: true
                    )
                    
                    // Save attestation
                    writeFile file: 'dist/attestation.json', text: response
                    
                    // Archive attestation
                    archiveArtifacts artifacts: 'dist/attestation.json'
                }
            }
        }
    }
    
    post {
        success {
            echo 'AI attestation created successfully!'
        }
    }
}
```

### CircleCI

Add to `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: circleci/node:14
    steps:
      - checkout
      - run: npm install
      - run: npm run build
      
  attest:
    docker:
      - image: circleci/node:14
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Create AI Attestation
          command: |
            # Install jq for JSON parsing
            sudo apt-get update && sudo apt-get install -y jq
            
            # Create attestation
            ATTESTATION=$(curl -s "https://attest.97115104.com/api/create.html" \
              --data-urlencode "content_name=$CIRCLE_PROJECT_REPONAME" \
              --data-urlencode "model=gpt-4" \
              --data-urlencode "role=assisted" \
              --data-urlencode "author=$CIRCLE_USERNAME" \
              --data-urlencode "output=json")
            
            # Save attestation
            echo "$ATTESTATION" > attestation.json
            
            # Extract verification URL
            VERIFY_URL=$(echo "$ATTESTATION" | jq -r '.verifyUrl')
            echo "Attestation created: $VERIFY_URL"
      
      - store_artifacts:
          path: attestation.json
          destination: ai-attestation

workflows:
  build-and-attest:
    jobs:
      - build
      - attest:
          requires:
            - build
```

### Azure DevOps

Add to `azure-pipelines.yml`:

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: Build
  jobs:
  - job: BuildJob
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '14.x'
    - script: |
        npm install
        npm run build
      displayName: 'Build project'

- stage: Attest
  dependsOn: Build
  jobs:
  - job: CreateAttestation
    steps:
    - script: |
        # Create attestation
        RESPONSE=$(curl -s "https://attest.97115104.com/api/create.html" \
          --data-urlencode "content_name=$(Build.Repository.Name)" \
          --data-urlencode "model=github-copilot" \
          --data-urlencode "role=assisted" \
          --data-urlencode "author=$(Build.RequestedFor)" \
          --data-urlencode "output=json")
        
        # Save attestation
        echo "$RESPONSE" > $(Build.ArtifactStagingDirectory)/attestation.json
        
        # Display verification URL
        echo "##vso[task.logissue type=warning]AI Attestation created: $(echo $RESPONSE | jq -r '.verifyUrl')"
      displayName: 'Create AI attestation'
    
    - task: PublishBuildArtifacts@1
      inputs:
        pathToPublish: '$(Build.ArtifactStagingDirectory)/attestation.json'
        artifactName: 'ai-attestation'
```

## Advanced Usage

### Creating Attestations with API Keys

If you have a premium API key for short URLs:

```bash
# First create the attestation
ATTESTATION=$(curl -s "https://attest.97115104.com/api/create.html?content_name=MyProject&model=gpt-4&role=generated&output=json")

# Then create a short URL
DATA_URL=$(echo "$ATTESTATION" | jq -r '.dataUrl')
SHORT_URL=$(curl -s -X POST "https://attest.97115104.com/api/shorten" \
  -H "Content-Type: application/json" \
  -d "{\"dataUrl\": \"$DATA_URL\", \"apiKey\": \"$ATTEST_INK_API_KEY\"}" \
  | jq -r '.shortUrl')

echo "Short URL: $SHORT_URL"
```

### Batch Attestations

For multiple files:

```bash
#!/bin/bash
# create-attestations.sh

for file in src/*.js; do
  if [ -f "$file" ]; then
    HASH=$(sha256sum "$file" | cut -d' ' -f1)
    ATTESTATION=$(curl -s "https://attest.97115104.com/api/create.html" \
      --data-urlencode "content_name=$(basename $file)" \
      --data-urlencode "content_hash=sha256:$HASH" \
      --data-urlencode "model=github-copilot" \
      --data-urlencode "role=assisted" \
      --data-urlencode "output=json")
    
    echo "$ATTESTATION" > "${file}.attestation.json"
  fi
done
```

### Docker Integration

Create attestations for Docker images:

```dockerfile
# Dockerfile
FROM node:14 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Create attestation
RUN apt-get update && apt-get install -y curl jq && \
    ATTESTATION=$(curl -s "https://attest.97115104.com/api/create.html?content_name=docker-image&model=github-copilot&role=assisted&output=json") && \
    echo "$ATTESTATION" > /app/attestation.json

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/attestation.json /usr/share/nginx/html/
```

### Terraform Integration

For infrastructure as code:

```hcl
# attestation.tf
data "external" "attestation" {
  program = ["bash", "-c", <<-EOT
    ATTESTATION=$(curl -s "https://attest.97115104.com/api/create.html?content_name=terraform-config&model=gpt-4&role=assisted&output=json")
    echo "$ATTESTATION"
  EOT
  ]
}

output "attestation_url" {
  value = jsondecode(data.external.attestation.result).verifyUrl
}
```

## Best Practices

### 1. Attestation Timing
- Create attestations after successful builds
- Include in release artifacts
- Update with each significant change

### 2. Content Hashing
- Always include content hashes for verification
- Hash entire directories for comprehensive coverage
- Use consistent hashing methods (SHA-256)

### 3. Metadata
- Include author information
- Use descriptive content names
- Add timestamps for audit trails

### 4. Storage
- Archive attestations with build artifacts
- Include in release packages
- Maintain historical records

### 5. Badge Display
- Add badges to README files
- Include in documentation
- Display on project websites

## Environment Variables

Set these in your CI/CD environment:

```bash
# Optional: API key for premium features
ATTEST_INK_API_KEY=ak_your_api_key

# Model preferences
AI_MODEL=gpt-4
AI_ROLE=assisted

# Author information
AI_AUTHOR="Your Team Name"
```

## Troubleshooting

### Common Issues

1. **Curl not available**
   ```bash
   # Install curl in your CI environment
   apt-get update && apt-get install -y curl
   # or
   yum install -y curl
   ```

2. **JSON parsing errors**
   ```bash
   # Install jq for JSON handling
   apt-get install -y jq
   # or use Python
   python -c "import json; print(json.loads('$RESPONSE')['verifyUrl'])"
   ```

3. **URL encoding issues**
   ```bash
   # Use --data-urlencode for proper encoding
   curl --data-urlencode "content_name=My Project Name"
   ```

4. **Large content handling**
   ```bash
   # For large files, use content hash instead of full content
   HASH=$(sha256sum largefile.bin | cut -d' ' -f1)
   curl --data-urlencode "content_hash=sha256:$HASH"
   ```

## Examples Repository

Find complete examples for various CI/CD platforms at:
https://github.com/97115104/attest/tree/main/examples/ci-cd

## Support

- Documentation: https://attest.97115104.com/docs
- Issues: https://github.com/97115104/attest/issues
- Email: support@attest.97115104.com

---

Last updated: August 2025