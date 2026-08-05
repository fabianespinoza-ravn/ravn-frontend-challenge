import { Check, Diamond, Tag } from 'lucide-react'
import { taskTags } from '@/entities/task/model/apiTask'
import { tagLabels } from '@/entities/task/model/taskLabels'
import type { TaskCreationForm } from '../../model/useTaskCreationForm'
import { FieldDropdown, type FieldVariant } from './FieldDropdown'
import styles from './FieldDropdown.module.css'

type LabelFieldProps = {
  form: TaskCreationForm
  variant?: FieldVariant
}

export function LabelField({ form, variant }: LabelFieldProps) {
  const { toggleTag, values } = form
  const selectedLabels = values.tags.map((tag) => tagLabels[tag])
  const isRow = variant === 'row'
  const TriggerIcon = isRow ? Tag : Diamond

  return (
    <FieldDropdown
      isFilled={selectedLabels.length > 0}
      label="Label"
      panelTitle="Tag Title"
      trigger={
        <>
          {isRow || selectedLabels.length === 0 ? (
            <TriggerIcon aria-hidden="true" size={16} />
          ) : null}
          {selectedLabels.length > 0 ? (
            <span
              className={
                isRow ? `${styles.triggerTags} ${styles.triggerTagsRow}` : styles.triggerTags
              }
            >
              {selectedLabels.map((selectedLabel) => (
                <span className={styles.triggerTag} key={selectedLabel}>
                  {selectedLabel}
                </span>
              ))}
            </span>
          ) : (
            <span className={styles.triggerLabel}>Label</span>
          )}
        </>
      }
      value={selectedLabels.join(', ') || undefined}
      variant={variant}
    >
      {() =>
        taskTags.map((tag) => {
          const isSelected = values.tags.includes(tag)

          return (
            <button
              aria-pressed={isSelected}
              className={styles.option}
              key={tag}
              onClick={() => toggleTag(tag)}
              type="button"
            >
              {isRow ? (
                <span
                  className={
                    isSelected ? `${styles.checkbox} ${styles.isChecked}` : styles.checkbox
                  }
                >
                  {isSelected ? <Check aria-hidden="true" size={12} /> : null}
                </span>
              ) : (
                <span
                  className={
                    isSelected ? `${styles.optionIcon} ${styles.isSelectedIcon}` : styles.optionIcon
                  }
                >
                  <Diamond
                    aria-hidden="true"
                    fill={isSelected ? 'currentColor' : 'none'}
                    size={16}
                  />
                </span>
              )}
              {tagLabels[tag]}
            </button>
          )
        })
      }
    </FieldDropdown>
  )
}
