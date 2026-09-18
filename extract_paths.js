const fs = require('fs');
const raw = fs.readFileSync('C:/Users/Admin/.gemini/antigravity-ide/brain/07603c60-7ed7-4f0f-b2bb-71f6f95f176e/.system_generated/steps/231/content.md', 'utf8');
const jsonStart = raw.indexOf('{"label"');
const jsExport = raw.slice(jsonStart);
const data = JSON.parse(jsExport);
data.locations.forEach(function(l) {
    process.stdout.write(l.id + ' -> ' + l.name + '\n');
});
process.stdout.write('\n\n--- KARNATAKA ---\n');
const ka = data.locations.find(function(l){ return l.id === 'ka'; });
if(ka) process.stdout.write(ka.path + '\n');
process.stdout.write('\n\n--- PUNJAB ---\n');
const pb = data.locations.find(function(l){ return l.id === 'pb'; });
if(pb) process.stdout.write(pb.path + '\n');
