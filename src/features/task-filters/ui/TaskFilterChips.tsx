import type { ReactNode } from 'react'
import { pointEstimates, taskTags } from '@/entities/task/model/apiTask'
import { taskStatuses } from '@/entities/task/model/task'
import { StatusDot } from '@/entities/task/ui/StatusDot'
import { getPointEstimateLabel, tagLabels } from '@/entities/task/model/taskLabels'
import type { TaskFilters } from '../model/taskFilters'
import styles from './TaskFilterChips.module.css'

/**
 * Spike only. The inline alternative to a `FieldDropdown` for the three filters
 * whose options are a small closed set: nothing opens, so narrowing the board
 * costs one tap instead of three and never covers what it is narrowing.
 *
 * Due date and Assignee are deliberately absent. A calendar is too large to
 * inline, and a teammate list has no fixed length.
 */
function ChipGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.label}>{label}</span>
      <div className={styles.chips}>{children}</div>
    </div>
  )
}

function Chip({
  children,
  isSelected,
  onClick,
}: {
  children: ReactNode
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button aria-pressed={isSelected} className={styles.chip} onClick={onClick} type="button">
      {children}
    </button>
  )
}

type ChipFilterProps<TKey extends keyof TaskFilters> = {
  onChange: (value: TaskFilters[TKey]) => void
  value: TaskFilters[TKey]
}

export function StatusChips({ onChange, value }: ChipFilterProps<'status'>) {
  return (
    <ChipGroup label="Status">
      <Chip isSelected={value === ''} onClick={() => onChange('')}>
        Any
      </Chip>
      {taskStatuses.map((status) => (
        <Chip
          isSelected={status.value === value}
          key={status.value}
          onClick={() => onChange(status.value)}
        >
          <StatusDot color={status.color} />
          {status.label}
        </Chip>
      ))}
    </ChipGroup>
  )
}

export function EstimateChips({ onChange, value }: ChipFilterProps<'pointEstimate'>) {
  return (
    <ChipGroup label="Estimate">
      <Chip isSelected={value === ''} onClick={() => onChange('')}>
        Any
      </Chip>
      {pointEstimates.map((estimate) => (
        <Chip isSelected={estimate === value} key={estimate} onClick={() => onChange(estimate)}>
          {getPointEstimateLabel(estimate)}
        </Chip>
      ))}
    </ChipGroup>
  )
}

/* Several at once, because the API matches any of them (5.10). */
export function TagsChips({ onChange, value }: ChipFilterProps<'tags'>) {
  return (
    <ChipGroup label="Label">
      <Chip isSelected={value.length === 0} onClick={() => onChange([])}>
        Any
      </Chip>
      {taskTags.map((tag) => (
        <Chip
          isSelected={value.includes(tag)}
          key={tag}
          onClick={() =>
            onChange(
              value.includes(tag) ? value.filter((current) => current !== tag) : [...value, tag],
            )
          }
        >
          {tagLabels[tag]}
        </Chip>
      ))}
    </ChipGroup>
  )
}
