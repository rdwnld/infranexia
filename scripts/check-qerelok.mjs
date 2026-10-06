import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1sQuMVrp-GAZu4TrUO5bn3Ul5fLELgNa_rIWDGAI-ujU/gviz/tq?tqx=out:json&gid=1937238989';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1));
      console.log('Cols:');
      json.table.cols.forEach((c, i) => {
        console.log(`  ${i}: ${c.label || c.id}`);
      });
      console.log('Total rows:', json.table.rows.length);
      if (json.table.rows.length > 0) {
        console.log('Sample Row 0:', json.table.rows[0].c.map((cell, i) => `${json.table.cols[i]?.label || i}=${cell ? cell.v : 'null'}`));
      }
      if (json.table.rows.length > 1) {
        console.log('Sample Row 1:', json.table.rows[1].c.map((cell, i) => `${json.table.cols[i]?.label || i}=${cell ? cell.v : 'null'}`));
      }
    } catch(e) {
      console.error('Error parsing:', e, data.substring(0, 200));
    }
  });
});
