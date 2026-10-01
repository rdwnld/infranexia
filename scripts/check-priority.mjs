import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1sQuMVrp-GAZu4TrUO5bn3Ul5fLELgNa_rIWDGAI-ujU/gviz/tq?tqx=out:json&gid=1129058778';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1));
    const headerRow = json.table.rows[0].c;
    const rows = json.table.rows.slice(1);

    headerRow.forEach((c, i) => {
      const label = c && c.v ? String(c.v) : '';
      let nonBlank = 0;
      const sample = new Set();
      rows.forEach(r => {
        const val = r.c[i] ? String(r.c[i].v).trim() : '';
        if (val && val !== '-') {
          nonBlank++;
          if (sample.size < 5) sample.add(val);
        }
      });
      if (label.toUpperCase().includes('PRIOR') || nonBlank > 0 && label.toUpperCase().includes('PRIOR')) {
        console.log(`HEM Col ${i}: "${label}" (non-blank: ${nonBlank}, sample: ${[...sample].join(', ')})`);
      }
    });
  });
});
