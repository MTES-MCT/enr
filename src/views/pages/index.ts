import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import ReactDOMServer from 'react-dom/server'
import Footer from '../components/footer'
import Header from '../components/header'
import AdminNotifyCandidates from './adminNotifyCandidates'
import AdminRegenerateCertificates from './adminRegenerateCertificates'
import DrealList from './drealList'
import ForgottenPassword from './forgottenPassword'
import ImportCandidates from './importCandidates'
import InvitationList from './invitationList'
import ListProjects from './listProjects'
import Login from './login'
import ModificationRequestDetails from './modificationRequestDetails'
import ModificationRequestList from './modificationRequestList'
import NewModificationRequest from './newModificationRequest'
import NotificationList from './notificationList'
import ProjectDetails from './projectDetails'
import ResetPassword from './resetPassword'
import Signup from './signup'
import Success from './success'

const LoginPage = makePresenterPage(Login)
const AdminNotifyCandidatesPage = makePresenterPage(AdminNotifyCandidates)
const AdminRegenerateCertificatesPage = makePresenterPage(AdminRegenerateCertificates)
const ImportCandidatesPage = makePresenterPage(ImportCandidates)
const ListProjectsPage = makePresenterPage(ListProjects)
const SignupPage = makePresenterPage(Signup)
const NewModificationRequestPage = makePresenterPage(NewModificationRequest)
const ForgottenPasswordPage = makePresenterPage(ForgottenPassword)
const ResetPasswordPage = makePresenterPage(ResetPassword)
const ProjectDetailsPage = makePresenterPage(ProjectDetails)
const DrealListPage = makePresenterPage(DrealList)
const InvitationListPage = makePresenterPage(InvitationList)
const NotificationListPage = makePresenterPage(NotificationList)
const ModificationRequestDetailsPage = makePresenterPage(ModificationRequestDetails)
const ModificationRequestListPage = makePresenterPage(ModificationRequestList)
const SuccessPage = makePresenterPage(Success)

export {
  LoginPage,
  ImportCandidatesPage,
  ListProjectsPage,
  SignupPage,
  NewModificationRequestPage,
  AdminNotifyCandidatesPage,
  AdminRegenerateCertificatesPage,
  ForgottenPasswordPage,
  ResetPasswordPage,
  ProjectDetailsPage,
  DrealListPage,
  InvitationListPage,
  NotificationListPage,
  ModificationRequestDetailsPage,
  ModificationRequestListPage,
  SuccessPage,
}

interface HasRequest {
  request: Request
}

/**
 * Turn a Page Component (pure) into a presenter that returns a full HTML page
 * @param pageComponent
 */
/* global JSX */
function makePresenterPage<T extends HasRequest>(pageComponent: (pageProps: T) => JSX.Element) {
  return (props: T): string =>
    insertIntoHTMLTemplate(
      ReactDOMServer.renderToStaticMarkup(Header(props)) +
        ReactDOMServer.renderToStaticMarkup(pageComponent(props)) +
        ReactDOMServer.renderToStaticMarkup(Footer())
    )
}

const headerPartial = fs.readFileSync(path.resolve(__dirname, '../template/header.html.partial'))
const footerPartial = fs.readFileSync(path.resolve(__dirname, '../template/footer.html.partial'))

/**
 * Insert html contents into the full template
 * @param htmlContents
 */
function insertIntoHTMLTemplate(htmlContents: string): string {
  return headerPartial + htmlContents + footerPartial
}
