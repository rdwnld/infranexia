import https from 'https';
import { parseHemRows } from '../src/modules/hem/hem.parser.js';

const url = 'https://docs.google.com/spreadsheets/d/1sQuMVrp-GAZu4TrUO5bn3Ul5fLELgNa_rIWDGAI-ujU/gviz/tq?tqx=out:json&gid=1129058778';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1));
    const parsed = parseHemRows(json.table, false);
    const counts = {};
    parsed.forEach(r => {
      const p = r.priorityByRSO;
      counts[p] = (counts[p] || 0) + 1;
    });
    console.log('Parsed priorityByRSO counts:', counts);
  });
});
