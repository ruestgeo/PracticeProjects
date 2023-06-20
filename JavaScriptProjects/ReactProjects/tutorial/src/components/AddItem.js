import { useState, useContext } from "react"
import ColorSelect, { DEFAULT_COLOR } from "./ColorSelect";
import { GenericContext } from '../contexts/GenericContext';


const AddItem = () => {
  const [text, setText] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [enabled, setEnabled] = useState(true);

  const { addItem /*, requestId*/ } = useContext(GenericContext);

  async function submit (e) {
    e.preventDefault();

    if (!text){
      alert('Item text required');
      return;
    }

    setEnabled(false);
    const id = -1; //await requestId();
    let item = {id, text, };
    if (desc && desc !== '')
      item["description"] = desc;
    if (color && color !== '')
      item["color"] = color;
    addItem(item).then(_ => {
      setText('');
      setDesc('');
      setColor(DEFAULT_COLOR);
    }).finally(() => setEnabled(true));
  }


  return (
    <form className="add-form" onSubmit={submit}>

      <div className="form-control">
        <label>Item</label>
        <input type="text" 
          name="item_text" 
          id="add_item_text" 
          placeholder="add item" 
          required="required"
          value={text}
          onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="form-control">
          <label>Description</label>
          <input type="text" 
            name="item_description" 
            id="add_item_description" 
            placeholder="item description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)} />
      </div>

      <ColorSelect selectedColor={color} setColor={setColor}/>

      <input type="submit" value="Save Item" className="btn btn-block" disabled={!enabled} />

    </form>
  )
}

export default AddItem