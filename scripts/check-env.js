#!/usr/bin/env node

// Quick environment validation script
console.log('🔍 Checking Paint It Forward environment setup...\n');

// Check if .env files exist
const fs = require('fs');
const path = require('path');

const envFiles = [
  '.env',
  '.env.local',
  'packages/frontend/.env.local'
];

const requiredVars = {
  '.env': ['GOOGLE_CLIENT_ID', 'ADMIN_EMAILS'],
  '.env.local': ['NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'NEXT_PUBLIC_API_URL'],
  'packages/frontend/.env.local': ['NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'NEXT_PUBLIC_API_URL']
};

let allGood = true;

envFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Missing: ${file}`);
    allGood = false;
    return;
  }
  
  console.log(`✅ Found: ${file}`);
  
  // Read and check variables
  const content = fs.readFileSync(fullPath, 'utf8');
  const required = requiredVars[file] || [];
  
  required.forEach(varName => {
    if (content.includes(`${varName}=`) && !content.includes(`${varName}=your_`)) {
      console.log(`  ✅ ${varName} is set`);
    } else {
      console.log(`  ❌ ${varName} needs to be configured`);
      allGood = false;
    }
  });
  
  console.log();
});

if (allGood) {
  console.log('🎉 Environment looks good! Try running:');
  console.log('   docker-compose up -d');
  console.log('   npm run dev              # SST dev server (API on port 3030)');
  console.log('   cd packages/frontend && npm run dev  # Frontend on port 3031');
  console.log('');
  console.log('Then visit: http://localhost:3031');
} else {
  console.log('🚨 Please fix the issues above before starting development.');
}