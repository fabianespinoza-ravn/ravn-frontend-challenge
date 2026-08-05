import { useEffect, useRef, type FormEvent } from 'react'
import type { User } from '@/entities/user/model/user'
import type { TaskCreationForm } from '../model/useTaskCreationForm'
import { AssigneeField } from './fields/AssigneeField'
import { DueDateField } from './fields/DueDateField'
import { EstimateField } from './fields/EstimateField'
import { LabelField } from './fields/LabelField'
import { StatusField } from './fields/StatusField'
import styles from './TaskForm.module.css'

type TaskFormProps = {
  assignees?: User[]
  form: TaskCreationForm
  id: string
  onSubmit?: () => void
}

/**
 * The iOS presentation of the shared draft: a prominent task title above a
 * stack of full-width fields, each opening its own popover.
 */
export function TaskForm({ assignees = [], form, id, onSubmit }: TaskFormProps) {
  const { setFieldValue, values } = form
  const nameRef = useRef<HTMLInputElement>(null)

  /*
   * This composition replaces the whole route, so it behaves like the modal and
   * takes focus on mount. That also lands the caret back in the draft when the
   * responsive container swaps from the modal to this page.
   */
  useEffect(() => {
    nameRef.current?.focus()
  }, [])

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
        ref={nameRef}
        type="text"
        value={values.name}
      />
      <div className={styles.fields}>
        <EstimateField form={form} variant="row" />
        <LabelField form={form} variant="row" />
        <AssigneeField assignees={assignees} form={form} variant="row" />
        <DueDateField form={form} variant="row" />
        <StatusField form={form} variant="row" />
      </div>
    </form>
  )
}
