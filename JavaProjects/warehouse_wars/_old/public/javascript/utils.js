function toggleDisplay (id){
    var elem = document.getElementById(id);
    if ( !(elem.hasAttribute('style')) ) elem.setAttribute('style',"display:none");
    else elem.removeAttribute('style');
}

function disableOverlay (overlay_elem){ //onclick="disableOverlay(this);"
    overlay_elem.classList.add("hidden");
}

function enableOverlay (overlay_id, text_id, text){
    document.getElementById(overlay_id).classList.remove("hidden");
    document.getElementById(text_id).innerHTML = text;
}


function toggleCollapsable (caller){
    caller.classList.toggle("active");
    var content = caller.nextElementSibling;
    if ( !content.classList.contains("collapsable_content") ) 
        return;
    if (content.style.maxHeight)
        content.style.maxHeight = null;
    else {
        content.style.maxHeight = content.scrollHeight + "px";
        let contentInfo = content.getBoundingClientRect();
        let id = content.id;
        let elemSize = content.scrollHeight;
        let top = contentInfo.top; //relative to viewport top
        let bottom = top + elemSize; //relative to viewport top
        //let viewTop = window.pageYOffset;
        //let viewBottom = viewTop + window.innerHeight;
        //console.log("top "+top);
        //console.log("bottom "+bottom);
        //console.log("height "+elemSize);
        //console.log("window Y offset "+window.pageYOffset);
        //console.log("window size "+window.innerHeight);
        if ( (elemSize+50 < window.innerHeight) && (bottom > window.innerHeight) ){ //can fit, but content is below view; scroll to bottom
            let offset = (top + window.pageYOffset) - (window.innerHeight - elemSize) + 80;
            //console.log("scrolling to bottom "+offset);
            $('html').animate({ scrollTop: offset }, 200);
        }
        else if ( (elemSize < window.innerHeight) && (top < 0) ){ //can fit, but content is above view; scroll to top (not sure if top can be negative)
            let offset = (top + window.pageYOffset) + 20;
            //console.log("scrolling to top not in view  "+offset);
            $('html').animate({ scrollTop: offset }, 200);
        }
        else if ( (elemSize > window.innerHeight) ){ //not all of content can fit, scroll to top
            let offset = (top + window.pageYOffset) + 20;
            //console.log("scrolling to top  "+offset);
            $('html').animate({ scrollTop: offset }, 200);
        }
        //else  console.log("not scrolling");
        //else all content can fit in view and is already in view; no scroll
    }
        
}



//https://www.w3schools.com/js/js_cookies.asp
function setCookie (cookie_name, cookie_val) { //no expiry (deleted on browser close)
    document.cookie = cookie_name + "=" + cookie_val + ";path=/"; //the setter concatenates
}
function setCookie1 (cookie_name, cookie_val, hoursToLive) { //expiry via hours(Number)
    var d = new Date();
    cookieExpiryDate = d;
    d.setTime(d.getTime() + (hoursToLive*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cookie_name + "=" + cookie_val + ";" + expires + ";path=/";
}
function setCookie2 (cookie_name, cookie_val, expiry) { //expiry via date(String)
    var d = new Date(expiry);
    cookieExpiryDate = d;
    var expires = "expires="+ d.toUTCString();
    document.cookie = cookie_name + "=" + cookie_val + ";" + expires + ";path=/";
}
function getCookie (cookie_name) { //return the cookie value
    var name = cookie_name + "=";
    var decodedCookie = decodeURIComponent(document.cookie); //the getter returns the entire cookies string
    var cookie_array = decodedCookie.split(';');
    for(var i = 0;  i < cookie_array.length;  i++) {
        var cookie = cookie_array[i].trim();
        if ( cookie.startsWith(name) ) {
            return cookie.substring(name.length);
        }
    }
    return null;
}


var cookieExpiryDate = null;
var cookieWatcher = null
function addCookieListener (){
    let id = getCookie("WW_Java_Id");
    if ( !id && ($("#main").hasClass("lobby")) ){
        alert("Display name has expired, please select a new display name");
        loadView("intro.html",removeCookieListener);
        return;
    }
    if (cookieExpiryDate)
        cookieWatcher = setTimeout(() => {
            if ( !id && ($("#main").hasClass("lobby")) ){
                alert("Display name has expired, please select a new display name");
                loadView("intro.html",removeCookieListener);
                return;
            }       
        }, cookieExpiryDate-30000); //30sec before expiry
}
function removeCookieListener (){
    clearTimeout(cookieWatcher);
    cookieWatcher = null;
}


