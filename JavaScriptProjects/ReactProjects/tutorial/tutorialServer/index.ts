//tutorial back end server
//for the sake of simplicity, no perm-storage will be used

import { Item, isItem } from './Item';
import ITEMS from './db.json';

import express, {Express, Request, Response/*, Router*/} from 'express';


const app: Express = express();
//const router: Router = express.Router(); //useful for creating modular routes
const port: number = 3080;

// middleware to read body, parse it and place results in req.body
app.use(express.json());             // for application/json
app.use(express.urlencoded({ extended: true }));       // for application/x-www-form-urlencoded


const items: Item[] = ITEMS;



//#region get

app.get('/', (req: Request, res: Response) => {
  console.log(`[${req.url}] get :: \nHello World!`);
  res.send('Hello World!');
});


app.get('/items', (req: Request, res: Response) => {
  console.log(`[${req.url}] get :: \nsending items\n${JSON.stringify(items,null,"  ")}`);
  res.status(200)
  .header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
  .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
  .send(items);
});


app.get('/id', (req: Request, res: Response) => {
  const id = generateUniqueId();
  console.log(`[${req.url}] get :: \nsending id: ${id}`);
  res.status(200)
  .header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
  .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
  .send(id+'');
});


//#endregion get



//#region options

app.options('/items', (req: Request, res: Response) => {
  console.log(`[${req.url}] options`);
  res.status(200)
  .header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
  .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
  .header('Access-Control-Allow-Headers', 'Content-Type, x-requested-with')
  .send();
});
app.options('/items/:itemId', (req: Request, res: Response) => {
  console.log(`[${req.url}] options`);
  res.status(200)
  .header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
  .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
  .send();
});
app.options('/id', (req: Request, res: Response) => {
  console.log(`[${req.url}] options`);
  res.status(200)
  .header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
  .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
  .header('Access-Control-Allow-Headers', 'Content-Type, x-requested-with')
  .send();
});

//#endregion options


//#region delete

app.delete('/items/:itemId', (req: Request, res: Response) => {
  console.log(`[${req.url}] delete :: \n${JSON.stringify(req.params)}\n ${typeof req.params['itemId']}`);
  res.header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
  .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  let remove_id: number = Number.parseInt(req.params['itemId'] ?? "-1");
  if (remove_id < 0 || !remove_id){
    res.status(400).send();
    return;
  }
  let removed_item: Item | undefined = items.splice(items.findIndex((item) => item.id === remove_id),1)[0];
  console.log("removed ::  "+JSON.stringify(removed_item ?? "ERROR_ITEM_NOT_FOUND"));
  removed_item ? res.status(200).send(removed_item):  res.status(400).send();
});


app.delete('/items', (req: Request, res: Response) => {
  console.log(`[${req.url}] delete :: \n${JSON.stringify(req.body)}`);
  res.header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
  .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  if (!req.body){
    res.status(400).send();
    return;
  }
  let remove_id: number = req.body.id;
  if (!remove_id){
    res.status(400).send();
    return;
  }
  let removed_item: Item | undefined = items.splice(items.findIndex((item) => item.id === remove_id),1)[0];
  console.log("removed ::  "+JSON.stringify(removed_item ?? "ERROR_ITEM_NOT_FOUND"));
  removed_item ? res.status(200).send(removed_item):  res.status(400).send();
});

//#endregion delete




//#region post

app.post('/items', (req: Request, res: Response) => {
  console.log(`[${req.url}] post :: \n${JSON.stringify(req.body)}`);
  res.header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
  .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  if (!req.body || !isItem(req.body)){
    res.status(400).send();
    return;
  }
  let add_item: Item = req.body;
  add_item.id = generateUniqueId();
  items.push(add_item); //assume no ordering to the collection
  console.log("added ::  "+JSON.stringify(add_item));
  res.status(200).send(add_item);
  //assume no errors in adding to the collection
});

//#endregion post




//#region put

app.put('/items', (req: Request, res: Response) => {
  console.log(`[${req.url}] put :: \n${JSON.stringify(req.body)}`);
  res.header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
  .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  if (!req.body || !isItem(req.body)){
    res.status(400).send();
    return;
  }
  let modify_item: Item = req.body;
  /*items.map(itemX => {
    if (itemX.id === modify_item.id) //merge & overwrite newer
      return Object.assign( itemX, modify_item );
    return itemX;
  });*/
  let idx: number = items.findIndex(itemX => itemX.id === modify_item.id);
  let old_item: Item | undefined = { "id": -1, ...items[idx]};
  if (!old_item){
    res.status(400).send();
    return;
  }
  let new_item: Item = Object.assign({}, old_item, modify_item);
  items[idx] = new_item;
  console.log(`old ::  ${JSON.stringify(old_item)}\nupdated ::  ${JSON.stringify(new_item)}`);
  res.status(200).send(new_item);
  //assume no errors in modifying the collection
});

//#endregion put




/*app.use((req: Request, res: Response, _) => {
  console.log(`[${req.url}] ${req.method}`);
  res.status(404).send(
      "Resource not found");
});*/

app.listen(port, () => {
  console.log(`Tutorial server listening on port ${port}`);
});



function generateUniqueId(): number{
  return Date.now();
}
