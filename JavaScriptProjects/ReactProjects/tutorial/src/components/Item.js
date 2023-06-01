
import { useContext } from 'react'
import PropTypes from 'prop-types'
import Button from './Button';
import { GenericContext } from '../contexts/GenericContext';


const PROMPT_DELETE = false;


const Item = ({item}) => {

  const {removeItem, updateItem} = useContext(GenericContext);

  function toggle () {
    console.log(`toggle ${item.id} to ${!item.toggle}`);
    updateItem({...item, "toggle": !item.toggle});
  }


  function destroy () {
    if (!PROMPT_DELETE || window.confirm(`Confirm delete item:\n  ${item.text}`)){
      console.log(`delete ${item.id}`);
      removeItem(item.id);
    }
  }


  return (
    <div className='item' style={{borderColor: item.color ? item.color : 'black'}}>

      <div className='grid-element'>
      <h3 className={item.toggle ? 'highlight' : ''} 
          style={{heigh: (item.description ? 'fit-content': '100%')}}
          onClick={toggle}>
          {item.text}
        </h3>
        {item.description ? (<p>{item.description}</p>) : (<></>)}
      </div>

      <div className="grid-element">
        <Button color="white" textColor="red" text="X"  floatAlign='right' 
          fn={destroy} />
      </div>

    </div>
  )
}


Item.propTypes = {
  item: PropTypes.exact({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    description: PropTypes.string,
    color: PropTypes.string,
    toggle: PropTypes.bool,
  }).isRequired
}




export default Item