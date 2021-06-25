import fs from 'fs'
import path from 'path'

import ReactDOMServer from 'react-dom/server'

import Header from '../components/header'
import Footer from '../components/footer'

import ListProjects from './listProjects'
import AdminNotifyCandidates from './adminNotifyCandidates'
import ImportCandidates from './importCandidates'
import NewModificationRequest from './newModificationRequest'
import ModificationRequestDetails from './modificationRequestDetails'
import ProjectDetails from './projectDetails'
import DrealList from './drealList'
import InvitationList from './invitationList'
import NotificationList from './notificationList'
import ModificationRequestList from './modificationRequestList'
import Statistiques from './statistiques'
import AdminRegenerateCertificates from './adminRegenerateCertificates'
import AdminAppelOffre from './adminAppelOffre'
import AdminUsers from './adminUsers'
import Success from './success'
import InvitationsAreDeprecated from './invitationsAreDeprecated'
import { Request } from 'express'

const AdminNotifyCandidatesPage = makePresenterPage(AdminNotifyCandidates)
const AdminRegenerateCertificatesPage = makePresenterPage(AdminRegenerateCertificates)
const ImportCandidatesPage = makePresenterPage(ImportCandidates)
const ListProjectsPage = makePresenterPage(ListProjects)
const NewModificationRequestPage = makePresenterPage(NewModificationRequest)
const ProjectDetailsPage = makePresenterPage(ProjectDetails)
const DrealListPage = makePresenterPage(DrealList)
const InvitationListPage = makePresenterPage(InvitationList)
const NotificationListPage = makePresenterPage(NotificationList)
const StatistiquesPage = makePresenterPage(Statistiques)
const ModificationRequestDetailsPage = makePresenterPage(ModificationRequestDetails)
const ModificationRequestListPage = makePresenterPage(ModificationRequestList)
const SuccessPage = makePresenterPage(Success)
const AdminAppelOffrePage = makePresenterPage(AdminAppelOffre)
const AdminUsersPage = makePresenterPage(AdminUsers)
const InvitationsAreDeprecatedPage = makePresenterPage(InvitationsAreDeprecated)

export {
  ImportCandidatesPage,
  ListProjectsPage,
  NewModificationRequestPage,
  AdminNotifyCandidatesPage,
  AdminRegenerateCertificatesPage,
  ProjectDetailsPage,
  DrealListPage,
  InvitationListPage,
  NotificationListPage,
  StatistiquesPage,
  ModificationRequestDetailsPage,
  ModificationRequestListPage,
  SuccessPage,
  AdminAppelOffrePage,
  AdminUsersPage,
  InvitationsAreDeprecatedPage,
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
