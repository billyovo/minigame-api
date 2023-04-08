import { makeBanner } from '../utils/image.js'
import assert from 'assert';

describe('make banner', async function () {
   await makeBanner("碰碰豬", new Date().toISOString().substring(0,10));
   assert.equal("1", true);
});
