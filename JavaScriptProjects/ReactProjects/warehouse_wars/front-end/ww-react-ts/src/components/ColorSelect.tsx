
import { useState, useRef, useMemo, useEffect } from 'react';

import './ColorSelect.css'



export const DEFAULT_COLOR = '#999999';





interface ColorSelectProps {
  selectedColor: string,
  setColor: React.Dispatch<React.SetStateAction<string>>
}


const ColorSelect = ({selectedColor = DEFAULT_COLOR, setColor}: ColorSelectProps) => {
  const [colors, setColors] = useState([{name:"default", value:DEFAULT_COLOR}, {name:'custom', value:selectedColor}]);

  const customIndex = useRef(1);
  const updateOnce = useRef(false);
  const loadedColors = useRef(false);


  function onColorSelect (newColor: string) {
    const oldColor = selectedColor;
    console.log(`change color from ${oldColor} to ${newColor}`);
    setColor(newColor);
  }


  function onColorCustom (newColor: string) {
    const oldColor = selectedColor;
    console.log(`custom change color from ${oldColor} to ${newColor}`);
    let newColors = [...colors];

    newColors[customIndex.current].value = newColor;
    setColors(newColors);
    setColor(newColor);
  }

  const fetchColors = async () => {
    if (loadedColors.current) 
      return;

    let data;
    try { 
      data = await ( await fetch('/colors.json') ).json(); 
    }
    catch (err) {
      console.error(err);
      return;
    }
    
    if (!Array.isArray(data)){
      console.error(`error in fetch colors\n${data}`)
      return;
    }
      
    data = data.filter(color => typeof color === "object" && color.hasOwnProperty("name") && color.hasOwnProperty("value"))
    .map(color => { color.value = color.value.toUpperCase(); return color; });
    setColors([...colors, ...data]); //setColors([colors[0], ...data, colors[1]]);
    loadedColors.current = true;
  };
  fetchColors();


  //roundabout way to prioritize selecting actual named options over custom
  //alternative is to have custom option at the end of the list of options
  useEffect(() => {
    if (!loadedColors.current)
      return;
    let selected = selectedColor.toUpperCase();
    let index = colors.slice(2).findIndex(color => color.value === selected);
    index += 2; //-1 => 1
    if (selectedColor === DEFAULT_COLOR)
      index = 0;
    //console.log(`index: ${index}`);
    if (index !== 1)
      setColor(selectedColor.toUpperCase());
  }, [selectedColor]);


  useMemo(() => {
    if (updateOnce.current || !loadedColors.current)
      return;
    customIndex.current = colors.findIndex(color => color.name === "custom");
    //console.log(`custom index: ${customIndex.current}`);
    updateOnce.current = true;
  }, [colors]);




  return (
    <div className="form-control">
      {/* <label>Color</label> */}

      <select className='color-select' 
        name="item_color_list" 
        id="add_item_color_list" 
        style={{borderColor: selectedColor}} 
        onChange={(e) => onColorSelect(e.target.value)}
        value={selectedColor}>

        { colors.map(color => (
          <option key={color.name} value={color.value} >{color.name}</option>
        )) }
      </select>

      <input className='color-select' 
        type="color" 
        name="item_color_custom" 
        id="add_item_color_custom" 
        value={selectedColor}
        onChange={(e) => onColorCustom(e.target.value.toLowerCase())} />

    </div>
  )
}



export default ColorSelect