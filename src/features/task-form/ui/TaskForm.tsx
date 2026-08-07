import { useEffect, useRef, type FormEvent } from 'react'
import type { User } from '@/entities/user/model/user'
import { taskFormStatusId } from '../model/taskForm'
import type { TaskFormState } from '../model/useTaskFormState'
import { AssigneeField } from './fields/AssigneeField'
import { DueDateField } from './fields/DueDateField'
import { EstimateField } from './fields/EstimateField'
import { LabelField } from './fields/LabelField'
import { StatusField } from './fields/StatusField'
import styles from './TaskForm.module.css'

type TaskFormProps = {
  assignees?: User[]
  form: TaskFormState
  id: string
  onSubmit?: () => void
}

/**
 * The iOS presentation of the shared draft: a prominent task title above a
 * stack of full-width fields, each opening its own popover.
 */
export function TaskForm({ assignees = [], form, id, onSubmit }: TaskFormProps) {
  const { markSubmitAttempted, missingFields, setFieldValue, values } = form
  const nameRef = useRef<HTMLInputElement>(null)

  /*
   * This composition replaces the whole route, so it behaves like the modal and
   * takes focus on mount. That also lands the caret back in the draft when the
   * responsive container swaps from the modal to this page.
   */
  useEffect(() => {
    nameRef.current?.focus()
  }, [])

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
        aria-describedby={missingFields.includes('name') ? taskFormStatusId : undefined}
        aria-invalid={missingFields.includes('name') || undefined}
        aria-label="Task Title"
        autoComplete="off"
        className={styles.title}
        id={`${id}-name`}
        onChange={(event) => setFieldValue('name', event.target.value)}
        placeholder="Task Title"
        ref={nameRef}
        type="text"
        value={values.name}
      />
      <div className={styles.fields}>
        <EstimateField
          form={form}
          isInvalid={missingFields.includes('pointEstimate')}
          variant="row"
        />
        <LabelField form={form} isInvalid={missingFields.includes('tags')} variant="row" />
        <AssigneeField assignees={assignees} form={form} variant="row" />
        <DueDateField form={form} isInvalid={missingFields.includes('dueDate')} variant="row" />
        <StatusField form={form} isInvalid={missingFields.includes('status')} variant="row" />
      </div>
    </form>
  )
}
