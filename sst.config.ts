import { SSTConfig } from 'sst'
import { MainStack } from './stacks/MainStack'

export default {
  config(_input) {
    return {
      name: 'everdrive',
      region: 'ap-southeast-2',
    }
  },
  stacks(app) {
    app.stack(MainStack)
  },
} satisfies SSTConfig
