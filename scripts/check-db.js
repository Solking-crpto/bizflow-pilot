const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const t = Date.now();
p.organization.count()
  .then(n => { console.log('MAINNET DB OK. Organizations:', n, '| took', Date.now() - t, 'ms'); return p.$disconnect(); })
  .catch(e => console.log('DB ERROR:', String(e.message).split('\n').filter(Boolean).pop()));
