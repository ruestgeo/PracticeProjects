import { DeliveryState } from "src/app/services/chat/common/delivery-state";


export interface ChatState {
    state: DeliveryState;
    message?: string;
    enabled: boolean;
}

/*
tried to make design open to expansion and customization
general procedure is as such:
    chat is sent
    (token is requested)
    (await token)
    send message 
    try catch error or failure
    set wait timeout on broadcast token
    retry fetch if timeout (N num attempts)
    catch error or failure


default -> ready or not ready
    previous should be error, failed, or complete

sending -> socket is available and preparing to send message; block

success -> message has been transferred; block
    previous should be sending

failed -> message could not be sent;  unblock
    previous should be sending

error -> an error occurred;  block temporarily with timeout
    previous doesn't matter
    if previous was success then ??

complete -> message was successfully broadcasted;  unblock and clear
    previous should be success


enabled controls whether the submit input is enabled.
text input is disabled on submit and will be re-enabled when submit is re-enabled, 
however it will not be disabled otherwise.
*/
