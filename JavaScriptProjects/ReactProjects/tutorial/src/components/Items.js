import { useContext /* useState */ } from 'react'
import Item from './Item'
import { GenericContext } from '../contexts/GenericContext';
//import _items from '../mock_data/mock_items.json' //const items = require('../mock_data/mock_items.json');


const Items = () => {

  const {items} = useContext(GenericContext);
  //console.log(items);


  return (
    <>
      {(items.length < 1) ? 
      (<p style={{color: 'gray'}}><i>No items</i></p>) :
      items.map((item) => (
        <Item key={item.id}
          item={item} />
      ))}
    </>
  )
}



export default Items