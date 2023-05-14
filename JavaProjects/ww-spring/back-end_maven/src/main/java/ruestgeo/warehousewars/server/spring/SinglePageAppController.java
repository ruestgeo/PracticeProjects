package ruestgeo.warehousewars.server.spring;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;





@Controller
public class SinglePageAppController implements ErrorController  {

    //String[] exclude = {
    //    "ww",
    //    "chat"
    //};
  
    //@GetMapping(value = {
    //  "/{regex:[\\w-]+}", 
    //  "/**/{regex:[\\w-]+}",
    //  "/{regex:[\\w-]+}/", 
    //  "/**/{regex:[\\w-]+}/"
    //})
    public String redirectAll () {
        return "forward:/"; //index.html
    }



    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());
            if(statusCode == HttpStatus.NOT_FOUND.value()) {
                return "forward:/"; //redirect to index.html
            }
            else return "error: "+statusCode;
        }
        return "error";
    }



}
