import { useRouter } from 'next/router'

export default {
  logo: <span>Roll your own Auth</span>,
  project: {
    link: 'https://github.com/smakosh/roll-your-own-auth'
  },
  docsRepositoryBase: 'https://github.com/smakosh/roll-your-own-auth/tree/main/apps/docs',
  useNextSeoProps() {
    const { asPath } = useRouter()
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – Ryo-auth'
      }
    }
  }
}