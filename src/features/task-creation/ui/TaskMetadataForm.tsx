import type { FormEvent } from 'react'
import type { User } from '@/entities/user/model/user'
import { taskCreationStatusId } from '../model/taskCreationForm'
import type { TaskCreationForm } from '../model/useTaskCreationForm'
import { AssigneeField } from './fields/AssigneeField'
import { DueDateField } from './fields/DueDateField'
import { EstimateField } from './fields/EstimateField'
import { LabelField } from './fields/LabelField'
import { StatusField } from './fields/StatusField'
import styles from './TaskMetadataForm.module.css'

type TaskMetadataFormProps = {
  assignees?: User[]
  form: TaskCreationForm
  id: string
  onSubmit?: () => void
}

/**
 * The desktop presentation of the shared draft: a borderless title and a row of
 * metadata controls that each swap their label for the selected value.
 */
export function TaskMetadataForm({ assignees = [], form, id, onSubmit }: TaskMetadataFormProps) {
  const { markSubmitAttempted, missingFields, setFieldValue, values } = form

  /*
   * Every attempt is recorded, including the ones that go no further, because
   * that is what turns the missing fields from silence into messages.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    markSubmitAttempted()
    onSubmit?.()
  }

  return (
    <form className={styles.root} id={id} noValidate onSubmit={handleSubmit}>
      <input
        aria-describedby={missingFields.includes('name') ? taskCreationStatusId : undefined}
        aria-invalid={missingFields.includes('name') || undefined}
        aria-label="Task Title"
        autoComplete="off"
        className={styles.title}
        id={`${id}-name`}
        onChange={(event) => setFieldValue('name', event.target.value)}
        placeholder="Task Title"
        type="text"
        value={values.name}
      />
      <div className={styles.fields}>
        <EstimateField form={form} isInvalid={missingFields.includes('pointEstimate')} />
        <AssigneeField assignees={assignees} form={form} />
        <LabelField form={form} isInvalid={missingFields.includes('tags')} />
        <DueDateField form={form} isInvalid={missingFields.includes('dueDate')} />
        <StatusField form={form} isInvalid={missingFields.includes('status')} />
      </div>
    </form>
  )
}
