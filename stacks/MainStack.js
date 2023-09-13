import { Api, StaticSite } from 'sst/constructs'

export function MainStack({ stack }) {
  const api = new Api(stack, 'api', {
    routes: {
      'GET /': 'packages/functions/src/lambda.handler',
    },
  })

  const site = new StaticSite(stack, 'react', {
    path: 'client',
    buildOutput: 'dist',
    buildCommand: 'npm run build',
    environment: {
      VITE_APP_API_URL: api.url,
    },
  })

  stack.addOutputs({
    ApiURL: api.url,
    SiteURL: site.url,
  })
}
