import { ResultAsync, ok, err, errAsync, okAsync, logger } from '../../core/utils'
import { SendEmailProps, NotificationProps, SendEmail } from '../../modules/notification'
import Mailjet from 'node-mailjet'
/**
 *
 * This call sends a message to the given recipient with vars and custom vars.
 *
 */

const TEMPLATE_ID_BY_TYPE: Record<NotificationProps['type'], number> = {
  designation: 1350523,
  'project-invitation': 1402576,
  'dreal-invitation': 1436254,
  'pp-gf-notification': 1463065,
  'dreal-gf-notification': 1528696,
  'relance-gf': 1554449,
  'pp-certificate-updated': 1765851,
  'modification-request-status-update': 2046625,
  'user-invitation': 2814281,
  'modification-request-confirmed': 2807220,
  'modification-request-cancelled': 2060611,
  'dreal-modification-received': 2857027,
  'pp-modification-received': 2859616,
}

interface SendEmailFromMailjetDeps {
  MJ_APIKEY_PUBLIC: string
  MJ_APIKEY_PRIVATE: string
  authorizedTestEmails: string[]
  isProduction: boolean
}

export const makeSendEmailFromMailjet = (deps: SendEmailFromMailjetDeps): SendEmail => {
  const { MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE, authorizedTestEmails, isProduction } = deps

  const mailjetClient = Mailjet.connect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE)

  return function sendEmailFromMailjet(props: SendEmailProps): ResultAsync<null, Error> {
    const { id, recipients, fromEmail, fromName, subject, type, variables } = props

    const templateId = TEMPLATE_ID_BY_TYPE[type]

    if (!templateId) {
      return errAsync(new Error('Cannot find template for type ' + type))
    }

    const authorizedRecepients = recipients.filter(({ email }) =>
      isAuthorizedEmail({ email, isProduction, authorizedTestEmails })
    )

    if (!authorizedRecepients.length) return okAsync(null)

    return ResultAsync.fromPromise(
      mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: fromEmail,
              Name: fromName,
            },
            To: authorizedRecepients.map(({ email, name }) => ({
              Email: email,
              Name: name,
            })),
            TemplateID: templateId,
            TemplateLanguage: true,
            Subject: subject,
            Variables: variables,
            CustomId: id,
          },
        ],
      }),
      (err: any) => new Error(err.message)
    ).andThen((result: any) => {
      const sentMessage = result.body.Messages[0]
      if (sentMessage?.Status === 'error') {
        const errorMessage = sentMessage.Errors.map((e) => e.ErrorMessage).join('; ')
        logger.error(errorMessage)
        return err(new Error(errorMessage))
      }
      return ok(null)
    })
  }
}

interface IsAuthorizedEmailProps {
  email: string
  authorizedTestEmails: string[]
  isProduction: boolean
}

function isAuthorizedEmail(args: IsAuthorizedEmailProps): boolean {
  const { email, authorizedTestEmails, isProduction } = args
  // If it is not production environment
  // Only authorize sending emails to emails listed in the AUTHORIZED_TEST_EMAILS environment var
  if (!isProduction && !authorizedTestEmails.includes(email)) {
    logger.error(
      `sendEmailNotification called outside of production environment on an unknown email, message stopped. : ${email}`
    )
    return false
  }

  return true
}
