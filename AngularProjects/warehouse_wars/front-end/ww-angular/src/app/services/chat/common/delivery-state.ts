/**
 * @enum {number}
 */
export enum DeliveryState {
    /** @member default -- service is either ready & enabled or not ready & disabled */
    'default', 
    /** @member sending -- message is being prepared to be sent */
    'sending', 
    /** @member success -- message has been successfully sent, but may have not been received */
    'success',
    /** @member failed -- message could not be sent */ 
    'failed', 
    /** @member error -- an error occurred:    
     * - when sending the message  
     * - when awaiting a sent message
     * - when fetching a message
     * - in the socket connection   */
    'error',
    /** @member complete -- sent message has been successfully received/broadcasted */
    'complete',
}
