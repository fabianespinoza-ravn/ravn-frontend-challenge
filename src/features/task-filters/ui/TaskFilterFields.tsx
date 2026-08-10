import { CalendarClock, Tag, UserRound } from 'lucide-react'
import { pointEstimates, taskTags } from '@/entities/task/model/apiTask'
import { taskStatuses } from '@/entities/task/model/task'
import { StatusDot } from '@/entities/task/ui/StatusDot'
import { getPointEstimateLabel, tagLabels } from '@/entities/task/model/taskLabels'
import { getUserInitials, type User } from '@/entities/user/model/user'
import { formatDueDateLabel } from '@/shared/lib/date/dueDate'
import { Avatar } from '@/shared/ui/avatar/Avatar'
import { DatePicker } from '@/shared/ui/date-picker/DatePicker'
import { FieldDropdown, type FieldVariant } from '@/shared/ui/field-dropdown/FieldDropdown'
import dropdownStyles from '@/shared/ui/field-dropdown/FieldDropdown.module.css'
import type { AssigneeFilter, TaskFilters } from '../model/taskFilters'

type FilterFieldProps<TKey extends keyof TaskFilters> = {
  onChange: (value: TaskFilters[TKey]) => void
  value: TaskFilters[TKey]
  /*
   * The panel decides it, not each field: below the layout breakpoint every one
   * of them becomes a full-width row whose options open centred over the screen,
   * which is what 5.34 gave the task form for the same reason.
   */
  variant?: FieldVariant
}

/**
 * The filter controls. They share the dropdown primitive with the task form and
 * nothing else: a form field validates an incomplete draft and reports what is
 * missing, while these only narrow a query, so every one of them offers an
 * `Any` option that a required field could never have.
 */
export function StatusFilter({ onChange, value, variant }: FilterFieldProps<'status'>) {
  const selected = taskStatuses.find((status) => status.value === value)

  return (
    <FieldDropdown
      isFilled={Boolean(selected)}
      label="Status"
      variant={variant}
      trigger={
        <>
          {/* Takes the colour of the chosen status, and stays an outline
              while none is, exactly as the options below it do. */}
          <StatusDot color={selected?.color} />
          <span className={dropdownStyles.triggerLabel}>{selected?.label ?? 'Status'}</span>
        </>
      }
      value={selected?.label}
    >
      {(close) => (
        <>
          <AnyOption isSelected={value === ''} onSelect={() => onChange('')} close={close} />
          {taskStatuses.map((status) => (
            <button
              aria-pressed={status.value === value}
              className={dropdownStyles.option}
              key={status.value}
              onClick={() => {
                onChange(status.value)
                close()
              }}
              type="button"
            >
              <StatusDot color={status.color} />
              {status.label}
            </button>
          ))}
        </>
      )}
    </FieldDropdown>
  )
}

export function EstimateFilter({ onChange, value, variant }: FilterFieldProps<'pointEstimate'>) {
  return (
    <FieldDropdown
      isFilled={value !== ''}
      label="Estimate"
      variant={variant}
      trigger={
        <span className={dropdownStyles.triggerLabel}>
          {value === '' ? 'Estimate' : getPointEstimateLabel(value)}
        </span>
      }
      value={value === '' ? undefined : getPointEstimateLabel(value)}
    >
      {(close) => (
        <>
          <AnyOption isSelected={value === ''} onSelect={() => onChange('')} close={close} />
          {pointEstimates.map((estimate) => (
            <button
              aria-pressed={estimate === value}
              className={dropdownStyles.option}
              key={estimate}
              onClick={() => {
                onChange(estimate)
                close()
              }}
              type="button"
            >
              {getPointEstimateLabel(estimate)}
            </button>
          ))}
        </>
      )}
    </FieldDropdown>
  )
}

/**
 * Several tags at once, because the API matches any of them (5.10) and closing
 * after each choice would force the control open again for the next one, the
 * same reason the form's label control stays open (5.23).
 */
export function TagsFilter({ onChange, value, variant }: FilterFieldProps<'tags'>) {
  const selectedLabels = value.map((tag) => tagLabels[tag])

  return (
    <FieldDropdown
      isFilled={value.length > 0}
      label="Label"
      variant={variant}
      trigger={
        <>
          <Tag aria-hidden="true" size={16} />
          <span className={dropdownStyles.triggerLabel}>
            {selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Label'}
          </span>
        </>
      }
      value={selectedLabels.join(', ') || undefined}
    >
      {() => (
        <>
          <AnyOption isSelected={value.length === 0} onSelect={() => onChange([])} />
          {taskTags.map((tag) => (
            <button
              aria-pressed={value.includes(tag)}
              className={dropdownStyles.option}
              key={tag}
              onClick={() =>
                onChange(
                  value.includes(tag)
                    ? value.filter((current) => current !== tag)
                    : [...value, tag],
                )
              }
              type="button"
            >
              {tagLabels[tag]}
            </button>
          ))}
        </>
      )}
    </FieldDropdown>
  )
}

export function DueDateFilter({ onChange, value, variant }: FilterFieldProps<'dueDate'>) {
  return (
    <FieldDropdown
      isFilled={value !== ''}
      label="Due date"
      panelClassName={dropdownStyles.panelFitsContent}
      variant={variant}
      trigger={
        <>
          <CalendarClock aria-hidden="true" size={16} />
          <span className={dropdownStyles.triggerLabel}>
            {formatDueDateLabel(value) ?? 'Due date'}
          </span>
        </>
      }
      value={formatDueDateLabel(value) ?? undefined}
    >
      {(close) => (
        <>
          <AnyOption isSelected={value === ''} onSelect={() => onChange('')} close={close} />
          <DatePicker
            onSelect={(nextValue) => {
              onChange(nextValue)
              close()
            }}
            value={value}
          />
        </>
      )}
    </FieldDropdown>
  )
}

type AssigneeFilterProps = {
  assignees: User[]
  onChange: (value: AssigneeFilter) => void
  value: AssigneeFilter
  variant?: FieldVariant
}

/**
 * Three states, and the API answers all three: anybody, nobody, or a teammate.
 * `null` really does return the unassigned tasks, confirmed by creating one and
 * finding it alone.
 */
export function AssigneeFilterField({ assignees, onChange, value, variant }: AssigneeFilterProps) {
  const selected = assignees.find((assignee) => assignee.id === value)
  const label = value === null ? 'Unassigned' : selected?.fullName

  return (
    <FieldDropdown
      isFilled={value !== ''}
      label="Assignee"
      panelTitle="Assigned to..."
      variant={variant}
      trigger={
        <>
          <UserRound aria-hidden="true" size={16} />
          <span className={dropdownStyles.triggerLabel}>{label ?? 'Assignee'}</span>
        </>
      }
      value={label}
    >
      {(close) => (
        <>
          <AnyOption isSelected={value === ''} onSelect={() => onChange('')} close={close} />
          <button
            aria-pressed={value === null}
            className={dropdownStyles.option}
            onClick={() => {
              onChange(null)
              close()
            }}
            type="button"
          >
            <span aria-hidden="true" className={dropdownStyles.optionIcon}>
              <UserRound size={16} />
            </span>
            Unassigned
          </button>
          {assignees.map((assignee) => (
            <button
              aria-pressed={assignee.id === value}
              className={dropdownStyles.option}
              key={assignee.id}
              onClick={() => {
                onChange(assignee.id)
                close()
              }}
              type="button"
            >
              <span aria-hidden="true" className={dropdownStyles.optionIcon}>
                <Avatar
                  alt=""
                  initials={getUserInitials(assignee.fullName)}
                  size="small"
                  src={assignee.avatar}
                />
              </span>
              {assignee.fullName}
            </button>
          ))}
        </>
      )}
    </FieldDropdown>
  )
}

/** Every filter can be switched off, which a required form field cannot. */
function AnyOption({
  close,
  isSelected,
  onSelect,
}: {
  close?: () => void
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      aria-pressed={isSelected}
      className={dropdownStyles.option}
      onClick={() => {
        onSelect()
        close?.()
      }}
      type="button"
    >
      Any
    </button>
  )
}
