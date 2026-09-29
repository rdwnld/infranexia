import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1sQuMVrp-GAZu4TrUO5bn3Ul5fLELgNa_rIWDGAI-ujU/gviz/tq?tqx=out:json&gid=1129058778';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1));
    // Let's check if there are any cells with formula or numbers in columns like STATUS GOLIVE or KLASIFIKASI CLOSED
    const rows = json.table.rows.slice(1);
    const statusGoliveCounts = {};
    rows.forEach(r => {
      const s = r.c[52] ? String(r.c[52].v).trim() : 'BLANK';
      statusGoliveCounts[s] = (statusGoliveCounts[s] || 0) + 1;
    });
    console.log('STATUS GOLIVE counts:', statusGoliveCounts);
  });
});
