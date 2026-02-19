const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');

const mode = process.argv[2] || 'auto'; // default to auto

function switchToPostgres() {
    const newSchema = schema
        .replace('provider = "sqlite"', 'provider = "postgresql"')
        .replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url = env("POSTGRES_PRISMA_URL")\n  directUrl = env("POSTGRES_URL_NON_POOLING")');

    fs.writeFileSync(schemaPath, newSchema);
    console.log('✅ Switched schema.prisma to PostgreSQL for Vercel deployment.');
}

function switchToSqlite() {
    const newSchema = schema
        .replace('provider = "postgresql"', 'provider = "sqlite"')
        .replace(/url\s*=\s*env\("POSTGRES_PRISMA_URL"\)\s*directUrl\s*=\s*env\("POSTGRES_URL_NON_POOLING"\)/, 'url = env("DATABASE_URL")');

    // Fallback regex if formatting changed
    if(newSchema.includes('postgresql')) {
        console.warn('⚠️  Could not robustly revert to SQLite. Please check schema.prisma manually.');
    } else {
        fs.writeFileSync(schemaPath, newSchema);
        console.log('✅ Reverted schema.prisma to SQLite for local development.');
    }
}

if(mode === 'postgres') {
    switchToPostgres();
} else if(mode === 'sqlite') {
    switchToSqlite();
} else if(mode === 'auto') {
    if(process.env.VERCEL || process.env.POSTGRES_PRISMA_URL) {
        console.log('🔄 Detected Vercel environment. Switching to Postgres...');
        switchToPostgres();
    } else {
        console.log('🔄 Detected local environment (no VERCEL env var). Ensuring SQLite...');
        // Only switch if currently postgres, to obtain idempotency or just force it
        if(schema.includes('postgresql')) {
            switchToSqlite();
        } else {
            console.log('✅ Already using SQLite.');
        }
    }
} else {
    console.log('Usage: node scripts/switch-db.js [postgres|sqlite|auto]');
}
