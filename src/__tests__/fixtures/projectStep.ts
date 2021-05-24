import { v4 as uuid } from 'uuid'

export default function makeFakeProjectStep(overrides?) {
  return {
    id: uuid(),
    type: 'garantie-financiere',
    projectId: uuid(),
    stepDate: new Date(),
    fileId: uuid(),
    submittedOn: new Date(),
    submittedBy: uuid(),
    createdAt: new Date(),
    ...overrides,
  }
}
