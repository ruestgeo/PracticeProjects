"use strict";
//tutorial back end server
//for the sake of simplicity, no perm-storage will be used
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Item_1 = require("../src/app/Item");
const my_example_items_1 = require("../src/app/my-example-items");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
//const router: Router = express.Router(); //useful for creating modular routes
const port = 3000;
// middleware to read body, parse it and place results in req.body
app.use(express_1.default.json()); // for application/json
app.use(express_1.default.urlencoded({ extended: true })); // for application/x-www-form-urlencoded
//#region get
app.get('/', (req, res) => {
    console.log(`[${req.url}] get :: \nHello World!`);
    res.send('Hello World!');
});
app.get('/items', (req, res) => {
    console.log(`[${req.url}] get :: \nsending ITEMS\n${JSON.stringify(my_example_items_1.ITEMS, null, "  ")}`);
    res.status(200)
        .header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
        .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
        .send(my_example_items_1.ITEMS);
});
//#endregion get
//#region options
app.options('/items', (req, res) => {
    console.log(`[${req.url}] options`);
    res.status(200)
        .header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
        .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
        .header('Access-Control-Allow-Headers', 'Content-Type, x-requested-with')
        .send();
});
app.options('/items/:itemId', (req, res) => {
    console.log(`[${req.url}] options`);
    res.status(200)
        .header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
        .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
        .send();
});
//#endregion options
//#region delete
app.delete('/items/:itemId', (req, res) => {
    console.log(`[${req.url}] delete :: \n${JSON.stringify(req.params)}\n ${typeof req.params['itemId']}`);
    res.header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
        .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    let remove_id = Number.parseInt(req.params['itemId'] ?? "-1");
    if (remove_id < 0 || !remove_id) {
        res.status(400).send();
        return;
    }
    let removed_item = my_example_items_1.ITEMS.splice(my_example_items_1.ITEMS.findIndex((item) => item.id === remove_id), 1)[0];
    console.log("removed ::  " + JSON.stringify(removed_item ?? "ERROR_ITEM_NOT_FOUND"));
    removed_item ? res.status(200).send(removed_item) : res.status(400).send();
});
app.delete('/items', (req, res) => {
    console.log(`[${req.url}] delete :: \n${JSON.stringify(req.body)}`);
    res.header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
        .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    if (!req.body) {
        res.status(400).send();
        return;
    }
    let remove_id = req.body.id;
    if (!remove_id) {
        res.status(400).send();
        return;
    }
    let removed_item = my_example_items_1.ITEMS.splice(my_example_items_1.ITEMS.findIndex((item) => item.id === remove_id), 1)[0];
    console.log("removed ::  " + JSON.stringify(removed_item ?? "ERROR_ITEM_NOT_FOUND"));
    removed_item ? res.status(200).send(removed_item) : res.status(400).send();
});
//#endregion delete
//#region post
app.post('/items', (req, res) => {
    console.log(`[${req.url}] post :: \n${JSON.stringify(req.body)}`);
    res.header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
        .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    if (!req.body || !(0, Item_1.isItem)(req.body)) {
        res.status(400).send();
        return;
    }
    let add_item = req.body;
    add_item.id = generateUniqueId();
    my_example_items_1.ITEMS.push(add_item); //assume no ordering to the collection
    console.log("added ::  " + JSON.stringify(add_item));
    res.status(200).send(add_item);
    //assume no errors in adding to the collection
});
//#endregion post
//#region put
app.put('/items', (req, res) => {
    console.log(`[${req.url}] put :: \n${JSON.stringify(req.body)}`);
    res.header('Access-Control-Allow-Origin', `${req.header("Origin")}`)
        .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    if (!req.body || !(0, Item_1.isItem)(req.body)) {
        res.status(400).send();
        return;
    }
    let modify_item = req.body;
    /*ITEMS.map(itemX => {
      if (itemX.id === modify_item.id) //merge & overwrite newer
        return Object.assign( itemX, modify_item );
      return itemX;
    });*/
    let idx = my_example_items_1.ITEMS.findIndex(itemX => itemX.id === modify_item.id);
    let old_item = { "id": -1, ...my_example_items_1.ITEMS[idx] };
    if (!old_item) {
        res.status(400).send();
        return;
    }
    let new_item = Object.assign({}, old_item, modify_item);
    my_example_items_1.ITEMS[idx] = new_item;
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
function generateUniqueId() {
    return Date.now();
}
