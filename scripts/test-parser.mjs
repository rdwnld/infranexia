import https from 'https';
import { parseHemRows } from '../src/modules/hem/hem.parser.js';

const SPREADSHEET_ID = '1dnXcxcN9uhmBff_Sau5Yz4kBpTZeDtt-Otf7EmHREqM';
const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=1129058778&headers=1`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1));
      const parsed = parseHemRows(json.table, false);
      let withTarget = 0;
      let withReal = 0;
      const sampleDates = new Set();
      parsed.forEach(r => {
        if (r.targetGolive) {
          withTarget++;
          sampleDates.add(r.targetGolive);
        }
        if (r.realisasiGolive) {
          withReal++;
          sampleDates.add(r.realisasiGolive);
        }
      });
      console.log(`Total rows: ${parsed.length}`);
      console.log(`Rows with targetGolive: ${withTarget}`);
      console.log(`Rows with realisasiGolive: ${withReal}`);
      console.log(`Sample dates found:`, [...sampleDates].slice(0, 10));
    } catch (err) {
      console.error('Error:', err);
    }
  });
});

