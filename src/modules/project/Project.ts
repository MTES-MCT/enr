import moment from 'moment-timezone'
import sanitize from 'sanitize-filename'
import _ from 'lodash'
import { DomainEvent, UniqueEntityID } from '../../core/domain'
import {
  err,
  isPositiveNumber,
  isStrictlyPositiveNumber,
  makePropertyValidator,
  ok,
  Result,
} from '../../core/utils'
import {
  AppelOffre,
  CertificateTemplate,
  makeProjectIdentifier,
  ProjectAppelOffre,
  User,
} from '../../entities'
import { EventStoreAggregate } from '../eventStore'
import {
  EntityNotFoundError,
  HeterogeneousHistoryError,
  IllegalInitialStateForAggregateError,
  IncompleteDataError,
} from '../shared'
import { ProjectDataForCertificate } from './dtos'
import {
  EliminatedProjectCannotBeAbandonnedError,
  IllegalProjectDataError,
  ProjectAlreadyNotifiedError,
  ProjectCannotBeUpdatedIfUnnotifiedError,
  ProjectNotEligibleForCertificateError,
} from './errors'
import {
  LegacyProjectSourced,
  ProjectAbandonned,
  ProjectCertificateGenerated,
  ProjectCertificateRegenerated,
  ProjectCertificateUpdated,
  ProjectClasseGranted,
  ProjectCompletionDueDateSet,
  ProjectDataCorrected,
  ProjectDataCorrectedPayload,
  ProjectDCRDueDateSet,
  ProjectGFDueDateSet,
  ProjectImported,
  ProjectNotificationDateSet,
  ProjectNotified,
  ProjectReimported,
} from './events'
import { toProjectDataForCertificate } from './mappers'

export interface Project extends EventStoreAggregate {
  notify: (
    notifiedOn: number
  ) => Result<null, IllegalProjectDataError | ProjectAlreadyNotifiedError>
  abandon: (user: User) => Result<null, EliminatedProjectCannotBeAbandonnedError>
  correctData: (
    user: User,
    data: ProjectDataCorrectedPayload['correctedData']
  ) => Result<null, ProjectCannotBeUpdatedIfUnnotifiedError | IllegalProjectDataError>
  setNotificationDate: (
    user: User,
    notifiedOn: number
  ) => Result<null, ProjectCannotBeUpdatedIfUnnotifiedError | IllegalProjectDataError>
  moveCompletionDueDate: (
    user: User,
    delayInMonths: number
  ) => Result<null, ProjectCannotBeUpdatedIfUnnotifiedError | IllegalProjectDataError>
  updateCertificate: (
    user: User,
    certificateFileId: string
  ) => Result<null, ProjectCannotBeUpdatedIfUnnotifiedError>
  grantClasse: (user: User) => Result<null, never>
  addGeneratedCertificate: (args: {
    projectVersionDate: Date
    certificateFileId: string
    reason?: string
  }) => Result<null, never>
  readonly shouldCertificateBeGenerated: boolean
  readonly appelOffre: ProjectAppelOffre
  readonly isClasse: boolean
  readonly certificateData: Result<
    {
      template: CertificateTemplate
      data: ProjectDataForCertificate
    },
    IncompleteDataError | ProjectNotEligibleForCertificateError
  >
  readonly certificateFilename: string
  readonly data: ProjectDataProps | undefined
  readonly lastCertificateUpdate: Date | undefined
}

export interface ProjectDataProps {
  numeroCRE: string
  appelOffreId: string
  periodeId: string
  familleId: string
  nomProjet: string
  territoireProjet: string
  puissance: number
  prixReference: number
  evaluationCarbone: number
  note: number
  nomCandidat: string
  nomRepresentantLegal: string
  email: string
  adresseProjet: string
  codePostalProjet: string
  communeProjet: string
  engagementFournitureDePuissanceAlaPointe: boolean
  isFinancementParticipatif: boolean
  isInvestissementParticipatif: boolean
  motifsElimination: string
}

export interface ProjectProps {
  projectId: UniqueEntityID
  appelOffre: ProjectAppelOffre
  notifiedOn: number
  completionDueOn: number
  hasCompletionDueDateMoved: boolean
  lastUpdatedOn: Date
  lastCertificateUpdate: Date | undefined
  hasError: boolean
  isClasse: boolean
  data: ProjectDataProps | undefined
}

const projectValidator = makePropertyValidator({
  puissance: isStrictlyPositiveNumber,
  prixReference: isPositiveNumber,
  note: isPositiveNumber,
  evaluationCarbone: isPositiveNumber,
})

export const makeProject = (args: {
  projectId: UniqueEntityID
  history: DomainEvent[]
  appelsOffres: Record<AppelOffre['id'], AppelOffre>
}): Result<Project, EntityNotFoundError | HeterogeneousHistoryError> => {
  const { history, projectId, appelsOffres } = args

  if (!history || !history.length) {
    return err(new EntityNotFoundError())
  }

  if (!_allEventsHaveSameAggregateId()) {
    return err(new HeterogeneousHistoryError())
  }

  const initialAppelOffre = _getInitialAppelOffreFromHistory()
  if (!initialAppelOffre) {
    return err(new IllegalInitialStateForAggregateError())
  }

  const initialClasse = _getInitialClasse()
  if (initialClasse === null) {
    return err(new IllegalInitialStateForAggregateError())
  }

  const pendingEvents: DomainEvent[] = []
  const props: ProjectProps = {
    notifiedOn: 0,
    completionDueOn: 0,
    hasCompletionDueDateMoved: false,
    projectId,
    appelOffre: initialAppelOffre,
    isClasse: initialClasse,
    data: undefined,
    hasError: false,
    lastUpdatedOn: history[0].occurredAt,
    lastCertificateUpdate: undefined,
  }

  // Initialize aggregate by processing each event in history
  for (const event of history) {
    _processEvent(event)

    if (props.hasError) {
      return err(new IllegalInitialStateForAggregateError())
    }
  }

  // public methods
  return ok({
    notify: function (notifiedOn) {
      const { appelOffre, data, projectId } = props

      if (props.notifiedOn) {
        return err(new ProjectAlreadyNotifiedError())
      }

      if (!data || !data.email) {
        return err(new IllegalProjectDataError({ email: "le projet n'a pas d'email de contact" }))
      }

      _publishEvent(
        new ProjectNotified({
          payload: {
            projectId: projectId.toString(),
            appelOffreId: appelOffre.id,
            periodeId: appelOffre.periode.id,
            familleId: appelOffre.famille?.id,
            candidateEmail: data.email,
            candidateName: data.nomRepresentantLegal || '',
            notifiedOn,
          },
        })
      )

      _updateDCRDate()
      _updateGFDate()
      _updateCompletionDate()

      return ok(null)
    },
    abandon: function (user) {
      if (!props.isClasse) {
        return err(new EliminatedProjectCannotBeAbandonnedError())
      }

      _publishEvent(
        new ProjectAbandonned({
          payload: {
            projectId: projectId.toString(),
            abandonAcceptedBy: user.id,
          },
        })
      )

      return ok(null)
    },
    correctData: function (user, corrections) {
      if (!_isNotified() || !props.data) {
        return err(new ProjectCannotBeUpdatedIfUnnotifiedError())
      }

      // Compute delta with what has changed
      const delta = Object.entries(corrections).reduce(
        (modifiedData, [correctionKey, correctionValue]) => {
          // If the specific property is missing from props.data
          // or it's value has changed, add it to the delta
          if (
            typeof correctionValue !== 'undefined' &&
            props.data &&
            (typeof props.data[correctionKey] === 'undefined' ||
              props.data[correctionKey] !== correctionValue)
          ) {
            modifiedData[correctionKey] = correctionValue
          }

          return modifiedData
        },
        {}
      ) as Partial<ProjectDataProps>

      if (!delta || !Object.keys(delta).length) {
        return ok(null)
      }

      return _validateProjectFields(delta).andThen(() => {
        _publishEvent(
          new ProjectDataCorrected({
            payload: {
              projectId: props.projectId.toString(),
              correctedBy: user.id,
              correctedData: delta,
            },
          })
        )
        return ok(null)
      })
    },
    moveCompletionDueDate: function (user, delayInMonths) {
      if (!_isNotified()) {
        return err(new ProjectCannotBeUpdatedIfUnnotifiedError())
      }

      const newCompletionDueOn = moment(props.completionDueOn)
        .add(delayInMonths, 'months')
        .toDate()
        .getTime()

      if (newCompletionDueOn <= props.notifiedOn) {
        return err(
          new IllegalProjectDataError({
            completionDueOn:
              'La nouvelle date de mise en service doit postérieure à la date de notification.',
          })
        )
      }

      _updateCompletionDate({ setBy: user.id, completionDueOn: newCompletionDueOn })

      return ok(null)
    },
    setNotificationDate: function (user, notifiedOn) {
      if (!_isNotified()) {
        return err(new ProjectCannotBeUpdatedIfUnnotifiedError())
      }

      try {
        isStrictlyPositiveNumber(notifiedOn)
      } catch (e) {
        return err(new IllegalProjectDataError({ notifiedOn: e.message }))
      }

      // If it's the same day, ignore small differences in timestamp
      if (moment(notifiedOn).tz('Europe/Paris').isSame(props.notifiedOn, 'day')) return ok(null)

      _publishEvent(
        new ProjectNotificationDateSet({
          payload: {
            projectId: props.projectId.toString(),
            notifiedOn,
            setBy: user.id,
          },
        })
      )

      _updateDCRDate()
      _updateGFDate()
      _updateCompletionDate()

      return ok(null)
    },
    updateCertificate: function (user, certificateFileId) {
      if (!_isNotified()) {
        return err(new ProjectCannotBeUpdatedIfUnnotifiedError())
      }

      _publishEvent(
        new ProjectCertificateUpdated({
          payload: {
            projectId: props.projectId.toString(),
            certificateFileId,
            uploadedBy: user.id,
          },
        })
      )

      return ok(null)
    },
    grantClasse: function (user) {
      if (!props.isClasse) {
        _publishEvent(
          new ProjectClasseGranted({
            payload: {
              projectId: props.projectId.toString(),
              grantedBy: user.id,
            },
          })
        )

        _updateDCRDate()
        _updateGFDate()
        _updateCompletionDate()
      }

      return ok(null)
    },
    addGeneratedCertificate: function ({ projectVersionDate, certificateFileId, reason }) {
      if (props.lastCertificateUpdate) {
        _publishEvent(
          new ProjectCertificateRegenerated({
            payload: {
              projectId: props.projectId.toString(),
              projectVersionDate,
              certificateFileId,
              reason,
            },
          })
        )
      } else {
        _publishEvent(
          new ProjectCertificateGenerated({
            payload: {
              projectId: props.projectId.toString(),
              projectVersionDate,
              certificateFileId,
              appelOffreId: props.appelOffre.id,
              periodeId: props.appelOffre.periode.id,
              candidateEmail: props.data?.email || '',
            },
          })
        )
      }

      return ok(null)
    },
    get pendingEvents() {
      return pendingEvents
    },
    get shouldCertificateBeGenerated() {
      return (
        _isNotified() &&
        _periodeHasCertificate() &&
        !_hasPendingEventOfType(ProjectCertificateUpdated.type) &&
        (!props.lastCertificateUpdate || props.lastCertificateUpdate < props.lastUpdatedOn)
      )
    },
    get appelOffre() {
      return props.appelOffre
    },
    get lastUpdatedOn() {
      return props.lastUpdatedOn
    },
    get isClasse() {
      return props.isClasse
    },
    get certificateData() {
      const { periode } = props.appelOffre
      if (!periode.isNotifiedOnPotentiel || !periode.certificateTemplate || !props.notifiedOn) {
        return err(new ProjectNotEligibleForCertificateError()) as Project['certificateData']
      }

      return toProjectDataForCertificate(props).map((data) => ({
        template: periode.certificateTemplate,
        data,
      }))
    },
    get certificateFilename() {
      if (!props.data) return 'attestation.pdf'

      const { appelOffre, data, projectId } = props
      const { familleId, numeroCRE, nomProjet } = data

      const potentielId = makeProjectIdentifier({
        appelOffreId: appelOffre.id,
        periodeId: appelOffre.periode.id,
        familleId,
        id: projectId.toString(),
        numeroCRE,
      })

      return sanitize(`${potentielId}-${nomProjet}.pdf`)
    },
    get id() {
      return projectId
    },
    get data() {
      return props.data
    },
    get lastCertificateUpdate() {
      return props.lastCertificateUpdate
    },
  })

  // private methods
  function _validateProjectFields(
    newProps: Partial<ProjectDataProps>
  ): Result<Partial<ProjectDataProps>, IllegalProjectDataError> {
    const errorsInFields = projectValidator(newProps)

    if ('familleId' in newProps) {
      const { appelOffreId, periodeId } = { ...props.data, ...newProps }
      if (!_getAppelOffreById(appelOffreId, periodeId, newProps.familleId)) {
        // Can't find family in appelOffre
        errorsInFields.familleId = "Cette famille n'existe pas pour cet appel d'offre"
      }
    }

    if (Object.keys(errorsInFields).length) {
      return err(new IllegalProjectDataError(errorsInFields))
    }

    return ok(newProps)
  }

  function _publishEvent(event: DomainEvent) {
    pendingEvents.push(event)
    _processEvent(event)
  }

  function _updateLastUpdatedOn(event: DomainEvent) {
    // only update lastUpdatedOn date for events that mutate the entity
    switch (event.type) {
      case LegacyProjectSourced.type:
      case ProjectImported.type:
      case ProjectReimported.type:
      case ProjectNotified.type:
      case ProjectNotificationDateSet.type:
      case ProjectCompletionDueDateSet.type:
      case ProjectDataCorrected.type:
      case ProjectClasseGranted.type:
        props.lastUpdatedOn = event.occurredAt
        break
      default:
        // ignore other event types
        break
    }
  }

  function _processEvent(event: DomainEvent) {
    switch (event.type) {
      case LegacyProjectSourced.type:
        props.data = event.payload.content
        props.notifiedOn = event.payload.content.notifiedOn
        _updateClasse(event.payload.content.classe)
        _updateAppelOffre(event.payload)
        break
      case ProjectImported.type:
        props.data = event.payload.data
        _updateClasse(event.payload.data.classe)
        _updateAppelOffre(event.payload)
        break
      case ProjectReimported.type:
        props.data = event.payload.data
        _updateClasse(event.payload.data.classe)
        _updateAppelOffre(event.payload.data)
        break
      case ProjectNotified.type:
      case ProjectNotificationDateSet.type:
        props.notifiedOn = event.payload.notifiedOn
        break
      case ProjectCompletionDueDateSet.type:
        if (props.completionDueOn !== 0) props.hasCompletionDueDateMoved = true
        props.completionDueOn = event.payload.completionDueOn
        break
      case ProjectDataCorrected.type:
        props.data = { ...props.data, ...event.payload.correctedData } as ProjectProps['data']
        _updateAppelOffre(event.payload.correctedData)
        break
      case ProjectCertificateUpdated.type:
        props.lastCertificateUpdate = event.occurredAt
        break
      case ProjectCertificateGenerated.type:
      case ProjectCertificateRegenerated.type:
        props.lastCertificateUpdate = event.payload.projectVersionDate || event.occurredAt
        break
      case ProjectClasseGranted.type:
        props.isClasse = true
        break
      default:
        // ignore other event types
        break
    }

    _updateLastUpdatedOn(event)
  }

  function _isNotified() {
    return !!props.notifiedOn
  }

  function _periodeHasCertificate() {
    return !!props.appelOffre.periode.isNotifiedOnPotentiel
  }

  function _updateAppelOffre(args: {
    appelOffreId?: string
    periodeId?: string
    familleId?: string
  }) {
    const { appelOffre: currentAppelOffre } = props

    const appelOffreId = args.appelOffreId || currentAppelOffre.id
    const periodeId = args.periodeId || currentAppelOffre.periode.id
    const familleId = args.familleId || currentAppelOffre.famille?.id

    const newAppelOffre = _getAppelOffreById(appelOffreId, periodeId, familleId)

    if (!newAppelOffre) {
      props.hasError = true
    } else {
      props.appelOffre = newAppelOffre
    }
  }

  function _updateClasse(classe: string) {
    props.isClasse = classe === 'Classé'
  }

  function _getAppelOffreById(
    appelOffreId,
    periodeId,
    familleId?: string
  ): ProjectAppelOffre | null {
    const appelOffre = appelsOffres[appelOffreId]

    if (!appelOffre) return null

    const periode = appelOffre.periodes.find((periode) => periode.id === periodeId)

    if (!periode) return null

    let famille
    if (familleId) {
      famille = appelOffre.familles.find((famille) => famille.id === familleId)

      if (!famille) return null
    }

    return { ...appelOffre, periode, famille } as ProjectAppelOffre
  }

  function _allEventsHaveSameAggregateId() {
    return history.every((event) => event.aggregateId?.includes(projectId.toString()))
  }

  function _isLegacyOrImport(event: DomainEvent): event is LegacyProjectSourced | ProjectImported {
    return event.type === LegacyProjectSourced.type || event.type === ProjectImported.type
  }

  function _getInitialAppelOffreFromHistory(): ProjectAppelOffre | null {
    const foundingEvent = history.find(_isLegacyOrImport)
    if (!foundingEvent) return null

    return _getAppelOffreById(foundingEvent.payload.appelOffreId, foundingEvent.payload.periodeId)
  }

  function _getInitialClasse(): boolean | null {
    const foundingEvent = history.find(_isLegacyOrImport)
    if (!foundingEvent) return null

    const classe =
      foundingEvent.type === LegacyProjectSourced.type
        ? foundingEvent.payload.content.classe
        : foundingEvent.payload.data.classe

    if (classe === 'Classé') return true
    else if (classe === 'Eliminé') return false

    return null
  }

  function _removePendingEventsOfType(type: DomainEvent['type']) {
    _.remove(pendingEvents, (event) => event.type === type)
  }

  function _hasPendingEventOfType(type: DomainEvent['type']) {
    return pendingEvents.some((event) => event.type === type)
  }

  function _updateDCRDate() {
    if (props.isClasse) {
      _removePendingEventsOfType(ProjectDCRDueDateSet.type)
      _publishEvent(
        new ProjectDCRDueDateSet({
          payload: {
            projectId: props.projectId.toString(),
            dcrDueOn: moment(props.notifiedOn).add(2, 'months').toDate().getTime(),
          },
        })
      )
    }
  }

  function _updateCompletionDate(forceValue?: { setBy: string; completionDueOn: number }) {
    if (!props.isClasse) return

    if (props.hasCompletionDueDateMoved && !forceValue) return

    const { setBy, completionDueOn } = forceValue || {}
    _removePendingEventsOfType(ProjectCompletionDueDateSet.type)
    _publishEvent(
      new ProjectCompletionDueDateSet({
        payload: {
          projectId: props.projectId.toString(),
          completionDueOn:
            completionDueOn ||
            moment(props.notifiedOn)
              .add(props.appelOffre.delaiRealisationEnMois, 'months')
              .toDate()
              .getTime(),
          setBy,
        },
      })
    )
  }

  function _shouldSubmitGF() {
    return (
      props.isClasse &&
      (!!props.appelOffre.famille?.soumisAuxGarantiesFinancieres ||
        props.appelOffre.id === 'Eolien')
    )
  }

  function _updateGFDate() {
    if (_shouldSubmitGF()) {
      _removePendingEventsOfType(ProjectGFDueDateSet.type)
      _publishEvent(
        new ProjectGFDueDateSet({
          payload: {
            projectId: props.projectId.toString(),
            garantiesFinancieresDueOn: moment(props.notifiedOn).add(2, 'months').toDate().getTime(),
          },
        })
      )
    }
  }
}
