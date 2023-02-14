import classNames from "classnames"
import { useRef } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)

  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className={classNames("RampInputCheckbox--input", {
          "RampInputCheckbox--input-disabled": disabled,
          "RampInputCheckbox--input-checked": checked,
        })}
        checked={checked}
        disabled={disabled}
        onChange={() => {
          onChange(!checked)
        }}
      />
    </div>
  )
}
