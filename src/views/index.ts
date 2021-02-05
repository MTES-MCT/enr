import Statistiques from './pages/statistiques'

import Header from './components/header'
import Footer from './components/footer'
import { makeIndexHtml } from './index.html'

import ReactDOMServer from 'react-dom/server'

function wrapComponent(Page, pageName) {
  return (props) =>
    makeIndexHtml({
      header: ReactDOMServer.renderToStaticMarkup(Header(props)),
      footer: ReactDOMServer.renderToStaticMarkup(Footer()),
      main: ReactDOMServer.renderToStaticMarkup(Page(props)),
      pageName,
      props,
    })
}

export const StatistiquesPage = wrapComponent(Statistiques, 'statistiques')
