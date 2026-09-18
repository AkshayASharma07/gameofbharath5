const https = require('https');
let d = '';
https.get('https://cdn.jsdelivr.net/npm/@svg-maps/india@2.0.0/index.js', function(r) {
    r.on('data', function(c) { d += c; });
    r.on('end', function() {
        // strip the export default wrapper
        const clean = d.replace('export default ', '').replace(/;\s*$/, '');
        const obj = eval('(' + clean + ')');
        const locs = obj.locations;
        locs.forEach(function(l) {
            process.stdout.write(l.id + '\t' + l.name + '\n');
        });
        const ka = locs.find(function(l) { return l.id === 'ka'; });
        const pb = locs.find(function(l) { return l.id === 'pb'; });
        const fs = require('fs');
        fs.writeFileSync('d:/Game of bharath/ka_path.txt', ka ? ka.path : 'NOT FOUND');
        fs.writeFileSync('d:/Game of bharath/pb_path.txt', pb ? pb.path : 'NOT FOUND');
        process.stdout.write('\nKarnataka path written: ' + (ka ? ka.path.length + ' chars' : 'NOT FOUND') + '\n');
        process.stdout.write('Punjab path written: ' + (pb ? pb.path.length + ' chars' : 'NOT FOUND') + '\n');
    });
});
