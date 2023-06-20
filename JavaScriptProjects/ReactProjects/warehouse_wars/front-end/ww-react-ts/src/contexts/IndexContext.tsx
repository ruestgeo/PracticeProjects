import React, { useContext, PropsWithChildren } from 'react';
import { Props } from '../types/Props';


/**
 * An indexable context holding a property object
 * @see https://react.dev/learn/passing-data-deeply-with-context
 */
export const IndexContext = React.createContext({});



export interface IndexProviderProps extends Props {
  contextKey: string,
  contextValue: Props
};
export interface IndexProviderProps2 extends Props {
  context: {
    [key: string]: Props
  }
};
export interface IndexConsumerProps extends Props {
  contextKey: string
};
interface IndexContext {
  [key: string]: Props
};



/**
 * Create a component providing properties to an indexable context
 * @param {*} props properties of the component
 * @param props.contextKey key index to the contextValue
 * @param props.contextValue an object of properties for contextKey
 * @returns html component
 */
export const IndexProvider = (props: PropsWithChildren<IndexProviderProps>) => {
  const { children, contextKey, contextValue } = props;
  const index: IndexContext = {...useContext(IndexContext)};
  index[contextKey] = contextValue;
  return (
    <IndexContext.Provider value={index}>
      { children }
    </IndexContext.Provider>
  );
}



/**
 * Create a component providing properties to an indexable context
 * @param {*} props properties of the component
 * @param props.context an object of properties with a key index
 * @returns html component
 */
export const IndexProvider2 = (props: PropsWithChildren<IndexProviderProps2>) => {
  const { children, context } = props;
  const index: IndexContext = {...useContext(IndexContext), ...context};
  return (
    <IndexContext.Provider value={index}>
      { children }
    </IndexContext.Provider>
  );
}



/**
 * A higher order component that takes an html component and wraps it with
 * as a consumer to an indexable context, expanding the context value as 
 * properties to the given component
 * @param {*} Component html component with a "contextKey" property
 * @returns html component factory (?)
 */
export const IndexConsumer = ( Component: React.FC<Props> ) => {
  return (props: PropsWithChildren<IndexConsumerProps>) => { 
    const key = props.contextKey;
    return (
      <IndexContext.Consumer>
        {(contextProps: Props) => {
          if (contextProps.hasOwnProperty(key)){
            console.log(`index context has ${key}`);
            return (
              <Component {...props} {...contextProps[key]} />
            )
          }
          else {
            console.log(`index context doesn't have ${key}`);
            return (
              <Component {...props} />
            )
          }
        }} 
      </IndexContext.Consumer>
    )
  }
}



/* 
example: 

const MyComponent2 = IndexConsumer( IndexComponent );

const IndexComponent = ({a, b, c, d, e}) => {
  return ( <>  {a} {b} {c} {d} {e} </> )
}

<IndexProvider contextKey="x" contextValue={{d:4, e:5, f:6}}>
  <IndexProvider contextKey="y" contextValue={{d:1, e:2, f:3}}>
    ...
      <MyComponent2 a={1} b={2} c={3} contextKey="x"/>
      <MyComponent2 a={1} b={2} c={3} contextKey="y"/>
    ...
  </IndexProvider>
</IndexProvider>

*/


