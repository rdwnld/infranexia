import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1sQuMVrp-GAZu4TrUO5bn3Ul5fLELgNa_rIWDGAI-ujU/gviz/tq?tqx=out:json&gid=1937238989';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1));
    const rows = json.table.rows;
    const cols = json.table.cols;
    
    const getColIdx = (name) => cols.findIndex(c => c && (c.label || '').trim().toUpperCase().includes(name.toUpperCase()));
    const iReg = getColIdx('REGION');
    const iDist = getColIdx('DISTRICT TIF');
    const iStatus = getColIdx('STATUS PROGRES');
    const iSubcon = getColIdx('SUBCON TA');
    const iKlas = getColIdx('KLASIFIKASI LOP');

    const regions = new Set();
    const districts = new Set();
    const statuses = new Set();
    const subcons = new Set();
    const klasifikasi = new Set();

    rows.forEach(r => {
      if (!r || !r.c) return;
      if (r.c[iReg]?.v) regions.add(r.c[iReg].v);
      if (r.c[iDist]?.v) districts.add(r.c[iDist].v);
      if (r.c[iStatus]?.v) statuses.add(r.c[iStatus].v);
      if (r.c[iSubcon]?.v) subcons.add(r.c[iSubcon].v);
      if (r.c[iKlas]?.v) klasifikasi.add(r.c[iKlas].v);
    });

    console.log('Regions:', [...regions]);
    console.log('Districts:', [...districts]);
    console.log('Statuses:', [...statuses]);
    console.log('Subcons:', [...subcons]);
    console.log('Klasifikasi:', [...klasifikasi]);
  });
});
