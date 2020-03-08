import fs from 'fs'
import path from 'path'

import ReactDOMServer from 'react-dom/server'

import Header from '../components/header'

import Login from './login'
import AdminDashboard from './adminDashboard'
import CandidateNotification from './candidateNotification'
import Signup from './signup'

const LoginPage = makePresenterPage(Login)
const AdminDashboardPage = makePresenterPage(AdminDashboard)
const CandidateNotificationPage = makeRawPage(CandidateNotification)
const SignupPage = makePresenterPage(Signup)

export { LoginPage, AdminDashboardPage, CandidateNotificationPage, SignupPage }

/**
 * Turn a Page Component (pure) into a presenter that returns a full HTML page
 * @param pageComponent
 */
function makePresenterPage(pageComponent) {
  return (props?: any): string =>
    insertIntoHTMLTemplate(
      ReactDOMServer.renderToStaticMarkup(Header(props)) +
        ReactDOMServer.renderToStaticMarkup(pageComponent(props))
    )
}

function makeRawPage(pageComponent) {
  return (props?: any) =>
    ReactDOMServer.renderToStaticMarkup(pageComponent(props))
}

const headerPartial = fs.readFileSync(
  path.resolve(__dirname, '../template/header.html.partial')
)
const footerPartial = fs.readFileSync(
  path.resolve(__dirname, '../template/footer.html.partial')
)

/**
 * Insert html contents into the full template
 * @param htmlContents
 */
function insertIntoHTMLTemplate(htmlContents: string): string {
  return headerPartial + htmlContents + footerPartial
}
