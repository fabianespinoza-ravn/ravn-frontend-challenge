import type { FormEvent } from 'react'
import type { User } from '@/entities/user/model/user'
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
  const { setFieldValue, values } = form

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit?.()
  }

  return (
    <form className={styles.root} id={id} noValidate onSubmit={handleSubmit}>
      <input
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
        <EstimateField form={form} />
        <AssigneeField assignees={assignees} form={form} />
        <LabelField form={form} />
        <DueDateField form={form} />
        <StatusField form={form} />
      </div>
    </form>
  )
}
