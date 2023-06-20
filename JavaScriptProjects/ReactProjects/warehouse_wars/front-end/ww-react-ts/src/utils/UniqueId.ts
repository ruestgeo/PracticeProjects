import { Mutex } from 'async-mutex';

import { IdAlreadyExistsError, InvalidPatternError, NoSuchCollectionError, NoSuchIdError, OutOfTokensError } from '../errors/UIDErrors';






const DEFAULT_NUM_ATTEMPTS = 20;

const collections: {[collection: string]: {lock: Mutex, col: Set<string>}} = {
  '': {
    lock: new Mutex(),
    col: new Set<string>()
  }
}



/** Generate a random case sensitive ID with hex or alphanumeric chars based on the given pattern.
 * @param {string} pattern a pattern consisting of special characters and alphanumerics.
 * if the pattern contains only a~f then hex is used, otherwise if the pattern contains g-z then all letters are used.
 * an example of a hex generating pattern is "[abc]-(D1)_". 
 * an example of an alphanumeric pattern is "[aZc]-(g1)_".
 * capitalization in the pattern is ignored.
 * @param {boolean} [options.noCase] (optional) if true, then returns all lowercase
 * @param {string} [options.collection] (optional) collections prefixed with underscore, "_", are reserved for system use
 * * @param {string} [options.numAttempts] (optional) 
 * @return {Promise<string>} a randomly generated ID with hex or alphanumeric chars (case sensitive)
 */
export async function generateUniqueId (pattern: string, options?: {noCase?: boolean, collection?: string, numAttempts?: number}): Promise<string>{
    
  let colName = (options?.collection ?? '');
  let collection;
  let lock;
  if (collections.hasOwnProperty(colName)){
    collection = collections[colName].col;
    lock = collections[colName].lock;
  }
  else {
    collection = new Set<string>();
    lock = new Mutex();
    collections[colName] = {
      col: collection,
      lock: lock
    }
  }
  let attempts = options?.numAttempts ?? DEFAULT_NUM_ATTEMPTS;

  let hex = (pattern.match(/[G-Zg-z]/g) == null);
  pattern = pattern.replace(/[A-Za-z0-9]/g,"0");
  let iter = pattern.replace(/[^A-Za-z0-9]/g,"-");
  if (!pattern.includes("0")) 
    throw new InvalidPatternError('pattern does not contain any alphanumerics'); //no pattern to generate

  let count = 0;
  const release = await lock.acquire();
  try{
    while (count++ < attempts){
      let uid = "";
      //let parts = pattern.replace(/[^A-Za-z0-9]/g,"-").split("-");
      let idx = 0; let idxA; let len; let part;
      let rand = () => { return Math.floor((1 + Math.random()) * 0x10000).toString(hex ? 16 : 36); }
      while (uid.length < pattern.length){
          /* search for special char */
          idxA = iter.indexOf("0",idx); //idxA start of 0 (end of special char)
          if (idxA < 0){ idxA = pattern.length; } //end of string
          if (idxA > idx){ //special char
              uid += pattern.substring(idx,idxA); 
              idx = idxA;
          } //idx = start of 0
          if (uid.length == pattern.length) break;

          /* search for alphanumeric char */
          idxA = iter.indexOf("-",idx); //end of 0
          if (idxA < 0){ idxA = pattern.length; } //end of string
          len = idxA-idx;
          if (!options?.noCase) part = rand().split('').map( c => { return (Math.random() < 0.5 ? c : c.toUpperCase()); }).join('');
          else part = rand();
          if (part.length > len) part = part.substring(part.length - len); //trim extra length
          uid += part;
          idx += part.length;
      }
      if (!collection.has(uid)){
        collection.add(uid);
        return uid;
      }
        
    }
    throw new OutOfTokensError(`could not generate UID in ${attempts} attempts`);
  }
  catch (error) { throw error; }
  finally { release(); }
}



/**
 * Relinquish possession of a previously generated unique ID
 * @param {string} uid
 * @param {string} [collectionName] (optional)
 */
export async function yieldUniqueId (uid: string, collectionName?: string) {
  let colName = (collectionName ?? '');
  if (!collections.hasOwnProperty(colName))
    throw new NoSuchCollectionError('Collection does not exist');
  let collection = collections[colName].col;
  const release = await collections[colName].lock.acquire();
  try {
    if (!collection.delete(uid))
      throw new NoSuchIdError('ID does not exist in the collection');
  }
  catch (e){ throw e; }
  finally { release(); }
}



/**
 * Reserve a unique ID
 * @param {string} uid
 * @param {string} [collectionName] (optional)
 */
export async function reserveUniqueId (uid: string, collectionName?: string) {
  let colName = (collectionName ?? '');
  let collection;
  if (!collections.hasOwnProperty(colName)){
    collection = new Set<string>();
    collection.add(uid);
    let lock = new Mutex();
    collections[colName] = { col: collection, lock: lock };
  }
  else {
    const release = await collections[colName].lock.acquire();
    try {
      collection = collections[colName].col;
      if (collection.has(uid))
        throw new IdAlreadyExistsError('ID already exists in the collection');
      collection.add(uid);
    }
    catch (e){ throw e; }
    finally { release(); }
  }
}
