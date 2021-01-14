import { isEmpty } from '../utils/util';
import * as OneSplitContract from '../contracts/OneSplit.contract'

class ArbService {

  public async getChance() {
    let res = await OneSplitContract.call.getExpectedReturn(
      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
      100,
      10,
      0
    )
    console.log(res)

    return res
  }

}

export default ArbService;
