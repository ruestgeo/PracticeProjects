import { ChangeEventHandler, FormEventHandler, MouseEventHandler, ReactNode } from "react"



const emptyFunc = ()=>{};


interface GameFormInputProps {
  id: string,
  label?: string,
  value: number,
  step: number,
  min: number,
  max: number,
  numberInput?: boolean,
  rangeInput?: boolean,
  output?: boolean,
  enabled?: boolean,
  onMouseUp?: MouseEventHandler<HTMLInputElement>, //range
  onInput?: FormEventHandler<HTMLInputElement>,    //range
  onChange?: ChangeEventHandler<HTMLInputElement>, //number
  children?: ReactNode,
  child?: JSX.Element,
}

function GameFormInput({ id, label, value, step, min, max, 
  onMouseUp=emptyFunc, onInput=emptyFunc, onChange=emptyFunc, 
  numberInput=true, rangeInput=false, output=false, enabled=true, child, children,
}: GameFormInputProps) {


  

  return (
    <div id={`${id}_configs`}>

      {label && (
        <label id={`${id}_label`}>{label}</label>
      )}
      
      {rangeInput && (
        <input type="range" id={`${id}_range`}
          value={value} step={step} min={min} max={max} 
          disabled={!enabled}
          onMouseUp={onMouseUp}
          onInput={onInput} />
      )}

      {output && (
        <output id={`${id}_output`}>{value}</output>
      )}

      {numberInput && (
        <input type="number" id={`${id}_number`}
          value={value} min={min} max={max} 
          disabled={!enabled}
          onChange={onChange} />
      )}
      
      {(children || child) && <br /> }
      
      {child}

      {(children && child) && <br /> }

      {children}

    </div>
  )
}

export default GameFormInput