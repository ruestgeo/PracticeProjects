import React, { PropsWithChildren } from 'react';
import { Props } from '../types/Props';


/**
 * A generic context holding a property object
 * @see https://react.dev/learn/passing-data-deeply-with-context
 */
export const GenericContext = React.createContext({});


//cannot useContext outside of functional component
///**
// * @returns the property object held in the generic context
// */
//export const GenericContextValue = () => {
//  return useContext(GenericContext); 
//}




//a component to wrap a component as a provider to a context
//by convension wrap App if value is global, otherwise wrap whatever component needs value
//useState if value should update
//props.children is a handle for inner HTML elements, in this case anything inner to the GenericProvider component

/**
 * Create a component providing properties to a generic context
 * @param {*} props properties of the component
 * @returns html component
 */
export const GenericProvider = (props: PropsWithChildren<Props>) => {
  const { children, ...newProps } = props; //destructure props to exclude children
  return (
    <GenericContext.Provider value={newProps}>
      { children }
    </GenericContext.Provider>
  );
}




//higher order function returning component wrapped as a consumer
//value from the nearest parent provider is used

/**
 * A higher order component that takes an html component and wraps it with
 * as a consumer to a generic context, expanding the context value as 
 * properties to the given component
 * @param {*} Component html component
 * @returns html component factory (?)
 */
export const GenericConsumer = ( Component: React.FC<Props> ) => {
  return (props: PropsWithChildren<Props>) => { 
    return (
      <GenericContext.Consumer>
        {(contextProps: Props) => (<Component {...props} {...contextProps} />)} 
      </GenericContext.Consumer>
    )
  }
}



/* 
example: 

const myComponent = GenericConsumer( GenericComponent );

const GenericComponent = ({a, b, c, d, e}) => {
  return ( <>  {a} {b} {c} {d} {e} </> )
}

<GenericProvider d={4} e={5}>
  ...
    <myComponent a={1} b={2} c={3} />
  ...
</GenericProvider>

*/


