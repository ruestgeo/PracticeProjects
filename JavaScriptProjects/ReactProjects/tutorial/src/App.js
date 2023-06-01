import { useState, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Test from './components/Test'
import Button from './components/Button'
import Items from './components/Items';
import AddItem from './components/AddItem';
import  { GenericProvider, GenericConsumer }  from './contexts/GenericContext';
import  { IndexProvider, IndexConsumer }  from './contexts/IndexContext';
import ReactLogo from './components/ReactLogo';



const SERVER_PATH = 'http://localhost:3080'; //'/mock_items.json';


const ExampleComponent = ({a, b, c, d, e}) => {
  return ( <>  {a} {b} {c} {d} {e} </> )
}
const MyComponent = GenericConsumer( ExampleComponent );
const MyComponent2 = IndexConsumer( ExampleComponent );




function App () {
  const hello = "hello world!";
  const nav = useNavigate();
  const location = useLocation();
  let count = 0;
  const loadedItems = useRef(false);
  const [addItemVisible, toggleAddItemVisible] = useState(false);
  const [items, setItems] = useState([]);


  useEffect(() => {
    if (loadedItems.current) 
      return;
    let fetchItems = async () => {
      let data;
      try {  data = await ( /*res = */ await fetch(`${SERVER_PATH}/items`) ).json();  }
      catch (err) {
        console.error(err);
        return;
      }
      if (!Array.isArray(data)){
        console.error(`error in fetch items\n${data}`)
        return;
      }
        
      data = data.filter(item => typeof item === "object" && item.hasOwnProperty("id") && item.hasOwnProperty("text"));
      setItems([...items, ...data].sort((a,b) => (a<b ? -1 : (a>b ? 1 : 0)) ));
      loadedItems.current = true;
    };
    fetchItems();
  }, [items]);

  


  async function requestId () {
    //return Date.now();
    let data;
    try {  data = await ( await fetch(`${SERVER_PATH}/id`) ).text();  }
    catch (err) {
      console.error(err);
      return;
    }
    if (typeof data !== 'number' && typeof data !== 'string'){
      console.error(`error in fetch id\n${data}`)
      return;
    }
    console.log(`new id: ${data}`);
    return data;
  }
  

  async function addItem (newItem) {
    let data;
    try {  data = await ( await fetch(`${SERVER_PATH}/items`, {
      method: 'POST', 
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(newItem)
    }) ).json();  }
    catch (err) {
      console.error(err);
      return;
    }
    if (typeof data !== 'object' && data.hasOwnProperty('id') && data.hasOwnProperty('text')){
      console.error(`error in fetch id\n${data}`)
      return;
    }
    console.log(`new id: ${data}`);
    setItems([...items, data].sort((a,b) => (a<b ? -1 : (a>b ? 1 : 0)) ));
  }
  
  
  
  async function removeItem (id) {
    try {  
      await fetch(`${SERVER_PATH}/items/${id}`, {method: 'DELETE'});
      console.log(`deleted ${id}`);
    }
    catch (err) {
      console.error(err);
      return;
    }
    setItems([...items].filter(item => item.id !== id));
  }
  
  
  
  async function updateItem (updatedItem) {
    let data;
    try {  data = await ( await fetch(`${SERVER_PATH}/items`, {
      method: 'PUT', 
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(updatedItem)
    }) ).json();  }
    catch (err) {
      console.error(err);
      return;
    }
    if (typeof data !== 'object' && data.hasOwnProperty('id') && data.hasOwnProperty('text')){
      console.error(`error in fetch id\n${data}`)
      return;
    }
    setItems([...items].map(item => {
      if (item.id === data.id){
        return data;
      }
      return item;
    }));
  }



  const ItemsContainer = () => {
    return (
      <div className="center">
        <div className="container">
          <GenericProvider  items={items} addItem={addItem} removeItem={removeItem} updateItem={updateItem} requestId={requestId}>
            <header>
              <h1>Items________</h1>
              <Button text={addItemVisible ? 'hide':'add '} 
                color={addItemVisible ? 'salmon':'green' }
                fn={() => {toggleAddItemVisible(!addItemVisible)}} floatAlign={"right"}></Button>
            </header>
            {addItemVisible ? (<AddItem />) : (<></>)}

            <Items />
          </GenericProvider>
        </div>
      </div>
    );
  }




  return (
    <>
      {hello} <Test str={"eee"}/>
      <Button color={"blue"} text={"click me"} fn={() => {console.log(`button pressed ${++count} times`)}} />
      <Button color={"red"} text={"does nothing"}/>
      <Button color={"purple"} text={"req id"} fn={requestId}/>
      <br />
      <Button color={"cyan"} text={"show react logo"} fn={() => nav('/react')} />
      <br />


      <GenericProvider d={4} e={5} f={6}> {/* prop.f is unused as MyComponent doesn't access that property */}
        <MyComponent a={1} b={2} c={3} /> {" generic context"}
      </GenericProvider>
      <br />
      <IndexProvider contextKey="x" contextValue={{d:4, e:5, f:6}}>
        <IndexProvider contextKey="y" contextValue={{d:1, e:2, f:3}}>
            <MyComponent2 a={1} b={2} c={3} contextKey="x"/> {" index context x"}
            <br/>
            <MyComponent2 a={1} b={2} c={3} contextKey="y"/> {" index context y"}
            <br/>
            <MyComponent2 a={1} b={2} c={3} contextKey="z"/> {" index context z"}
        </IndexProvider>
      </IndexProvider>


      

      <br />
      {location.pathname === '/react' && <p className="center">react logo</p>}
      <Routes>
        <Route exact path='/' element={<ItemsContainer />} />
        <Route exact path='/react' Component={ReactLogo} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
      
      
    </>
  );
}




export default App;






