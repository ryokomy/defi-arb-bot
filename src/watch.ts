import { createObjectCsvWriter } from 'csv-writer';
import * as moment from 'moment';
import axios from 'axios';
import { BuyTokenInterestRatePair } from './services/arb.service';
import fs from 'fs';
import cron from 'node-cron';

// -------------- Settings --------------
const orgToken = 'WETH';
const orgAmount = 1000;
const viaTokens: string[] = [
  'DAI',
  'WBTC',
  'USDC',
  'USDT',
  'TUSD',
  'BAT',
  'MKR',
  'SNX',
  'LINK',
  'MANA',
  'ENJ',
  'COMP',
  'AAVE',
  'YFI',
  'CRV',
  'SUSHI',
  'UNI',
  '1INCH',
  'SAI',
  'NMR',
  'ZRX',
  'BAL',
];
// -----------------------------------------

const startDate = moment.utc().toDate();
const filename = `./src/logs/watch/${startDate}-${orgToken}-${orgAmount}.csv`;

const writeRecord = async () => {
  console.log('Start...');

  const header = [];
  header.push({ id: 'date', title: 'DATE' });
  viaTokens.forEach(viaToken => {
    header.push({ id: viaToken, title: viaToken });
  });

  const path = filename;
  const append = fs.existsSync(path);

  const csvWriter = createObjectCsvWriter({
    path,
    header,
    append,
  });

  const date = moment.utc().toDate();
  console.log(`date: ${date}`);

  const url = 'http://localhost:3000/arb/watch';
  const res = await axios.get(url);
  const buyTokenInterestRatePairs = res.data.buyTokenInterestRatePairs as BuyTokenInterestRatePair[];

  const record = {};
  record['date'] = date;
  buyTokenInterestRatePairs.forEach(buyTokenInterestRatePair => {
    record[buyTokenInterestRatePair.buyToken] = buyTokenInterestRatePair.interestRate;
  });

  csvWriter
    .writeRecords([record]) // returns a promise
    .then(() => {
      console.log('...Done');
    });
};

const writeRecordSync = () => {
  writeRecord();
};

cron.schedule('* * * * *', writeRecordSync);
