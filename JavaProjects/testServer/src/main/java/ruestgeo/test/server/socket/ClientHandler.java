package ruestgeo.test.server.socket;


//import java.io.*;
import java.io.FileReader; 
import java.io.IOException;
import java.io.FileNotFoundException;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;

//import java.net.*;
import java.net.Socket;
import java.net.ServerSocket;
import java.net.SocketAddress;
import java.net.InetSocketAddress;
import java.net.InetAddress;
import java.net.URL;

import java.util.Optional; 
import java.util.ArrayList;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Timer; 
import java.util.TimerTask; 
import java.util.StringTokenizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;







/***
 * Client handler thread
 */
public class ClientHandler implements Runnable {
    static final File WEB_ROOT = new File("public");
    static final String DEFAULT_FILE = "index_s.html";
    static final String BAD_REQUEST_FILE = "400.html";
    static final String NOT_FOUND_FILE = "404.html";
    static final String METHOD_NOT_ALLOWED_FILE = "405.html";

    static final String MESSAGE_PREFIX = "JG_client::";

    static final Pattern MATCH_HTTP_ANY = Pattern.compile("^((GET)|(PUT)|(POST)|(DELETE)|(PATCH)|(HEAD)|(OPTION))\\s+/(\\S*)\\s+(HTTP/[0-2](\\.[0-9])?)$"); //  ^((GET)|(PUT)|(POST)|(DELETE)|(PATCH)|(HEAD)|(OPTION))\s+\/\S*\s+(HTTP\/[0-2](\.[0-9])?)$
    static final Pattern MATCH_GET_ANY = Pattern.compile("^(GET)\\s+/(\\S*)\\s+(HTTP/[0-2](\\.[0-9])?)$"); //  ^(GET)\s+\/\S*\s+(HTTP\/[0-2](\.[0-9])?)$
    static final Pattern MATCH_GET_ROOT = Pattern.compile("^(GET)\\s+/\\s+(HTTP/[0-2](\\.[0-9])?)$"); //  ^(GET)\s+\/\s+(HTTP\/[0-2](\.[0-9])?)$
    //static final Pattern MATCH_GET_FAVICON = Pattern.compile("^(GET\\s+)/favicon.ico\\s+(HTTP/[0-2](\\.[0-9])?)$");

    final JavaServer serverHandle;
    final Socket clientSocket;
    final String clientAddr;

    public ClientHandler (JavaServer server, Socket socket) {
        this.serverHandle = server;
        this.clientSocket = socket;
        this.clientAddr = this.clientSocket.getInetAddress().toString();
    }

    public void run() {
        Boolean close = false;
        BufferedReader in = null; 
        PrintWriter out = null; 
        BufferedOutputStream dataOut = null;		
        try {
            in = new BufferedReader(new InputStreamReader(this.clientSocket.getInputStream()));
            out = new PrintWriter(this.clientSocket.getOutputStream());
            dataOut = new BufferedOutputStream(this.clientSocket.getOutputStream());
            String input = in.readLine();
            System.out.println("input: "+input);

            
            if ( input.startsWith(MESSAGE_PREFIX) ){ 
                /* UNAVAILABLE */
                String content = input.substring(input.indexOf(MESSAGE_PREFIX));
                System.out.println("content:  "+content);
                if ( content.equals("hello world!") ){
                    out.println("hello client!"); 
                    out.flush(); 
                }
                else {
                    out.println("i didn't understand your message..."); 
                    out.flush(); 
                }
                /*debug*/close = true;
            }

            else if ( MATCH_HTTP_ANY.matcher(input).matches() ) {
                close = true;
                Matcher matchGetAny = MATCH_GET_ANY.matcher(input);
                if ( !matchGetAny.matches() ){
                    System.out.println("["+this.clientAddr+"] invalid HTTP request ::   "+input);
                    File file = new File(WEB_ROOT, METHOD_NOT_ALLOWED_FILE);
                    writeHttpResponse("405", file, out, dataOut);
                }


                else if ( MATCH_GET_ROOT.matcher(input).matches() ){
                    System.out.println("["+this.clientAddr+"] inbound HTTP request (root) ::   "+input);
                    File file = new File(WEB_ROOT, DEFAULT_FILE);
                    int fileLength = (int) file.length();
                    byte[] fileData = readFileData(file, fileLength);  
                    out.println("HTTP/1.1 200 OK");
                    out.println("Server: Java Socket Server : 1.0");
                    out.println("Date: " + new Date());
                    out.println("Content-type: text/html");
                    out.println("Content-length: " + fileLength);
                    out.println("Set-Cookie: test=testcookie123"); 
                    out.println("Connection: close");
                    out.println(); 
                    out.flush(); 
                    dataOut.write(fileData, 0, fileLength);
                    dataOut.flush();
                }


                else if ( matchGetAny.matches() ){
                    System.out.println("["+this.clientAddr+"] inbound HTTP request ::   "+input);
                    String requestedPath=matchGetAny.group(2);
                    System.out.println("--["+this.clientAddr+"] requested:  "+requestedPath);

                    File file = new File(WEB_ROOT, requestedPath);
                    if ( file.exists() ){
                        String fileName = file.getName();
                        String ext = Optional.ofNullable(fileName)
                            .filter(f -> f.contains("."))
                            .map(f -> f.substring(fileName.lastIndexOf(".")))
                            .get();
                        System.out.println("--requested file ["+requestedPath+"] found\n--file name: "+fileName+"\n--ext: "+ext);
                        writeHttpResponse(ext, file, out, dataOut); //use obtained ext
                        return;
                    }
                    System.out.println("--requested file ["+requestedPath+"] not found");
                    file = new File(WEB_ROOT, NOT_FOUND_FILE);
                    writeHttpResponse("404", file, out, dataOut);
                }


                else{ //shouldn't reach here
                    System.out.println("["+this.clientAddr+"] bad request ::   "+input);
                    File file = new File(WEB_ROOT, BAD_REQUEST_FILE);
                    writeHttpResponse("400", file, out, dataOut);                    
                }
            }
            else close = true;
        } 
        catch (Exception e) {
            System.err.println("!!! Client ["+this.clientAddr+"] handler error ::   "+ e.toString());
        }
        finally {
            try {
                in.close();
                out.close();
                if (close)
                    this.clientSocket.close();
            } catch (Exception e) {
                System.err.println("!!! Error closing stream ["+this.clientAddr+"] ::   " + e.toString());
            }
        }
    }
    private byte[] readFileData(File file, int fileLength) throws IOException {
        FileInputStream fileIn = null;
        byte[] fileData = new byte[fileLength];
        try {
            fileIn = new FileInputStream(file);
            fileIn.read(fileData);
        } finally {
            if (fileIn != null) 
                fileIn.close();
        }
        return fileData;
    }


    /***
     * Send HTTP response header and body given a file and its extension or a status code (400, 404, 405 are supported)
     * @param ext extention must be prefixed with "." or is otherwise a supported response header status code
     * @param file file to send to client
     * @param out output writer for response header
     * @param dataOut output stream for response body
     * @throws Exception
     */
    private void writeHttpResponse (String ext, File file, PrintWriter out, BufferedOutputStream dataOut) throws Exception{
        int fileLength = (int) file.length();
        byte[] fileData = readFileData(file, fileLength);  
        if ( !ext.startsWith(".") ){
            switch (ext){
                case "400":
                    out.println("HTTP/1.1 400 Bad Request");
                    break;
                case "404":
                    out.println("HTTP/1.1 404 Not Found");
                    break;
                case "405":
                    out.println("HTTP/1.1 405 Method Not Allowed");
                    break;
                default:
                    throw new Exception("An error occured when preparing to send the HTTP response: invalid 'ext'");
            }
            out.println("Server: Java Socket Server : 1.0");
            out.println("Date: " + new Date());
            out.println("Content-type: text/html");
            out.println("Content-length: " + fileLength);
            out.println("Connection: close");
            out.println(); 
            out.flush(); 
            dataOut.write(fileData, 0, fileLength);
            dataOut.flush();
            return;
        }


        out.println("HTTP/1.1 200 OK");
        out.println("Server: Java Socket Server : 1.0");
        out.println("Date: " + new Date());
        out.println("Content-length: " + fileLength);
        out.println("Connection: close");
        switch (ext){
            case ".txt":
                out.println("Content-type: text/plain");
                out.println("x-content-type-options: nosniff");
                break;

            case ".html":
                out.println("Content-type: text/html");
                out.println("x-content-type-options: nosniff");
                break;

            case ".xml":
                out.println("Content-type: text/xml");
                out.println("x-content-type-options: nosniff");
                break;

            case ".js":
                out.println("Content-type: application/javascript");
                out.println("x-content-type-options: nosniff");
                break;

            case ".css":
                out.println("Content-type: text/css");
                out.println("x-content-type-options: nosniff");
                break;

            case ".ico":
                out.println("Content-type: image/x-icon");
                break;

            case ".png":
                out.println("Content-type: image/png");
                break;

            case ".jpeg":
                out.println("Content-type: image/jpeg");
                break;

            case ".jpg":
                out.println("Content-type: image/jpeg");
                break;
                
            case ".gif":
                out.println("Content-type: image/gif");
                break;

            case ".mp3":
                out.println("Content-type: audio/mpeg");
                break;

            case ".mp4":
                out.println("Content-type: video/mp4");
                break;

            default: //no extention...send raw?
                ;

        }
        out.println(); 
        out.flush(); 
        dataOut.write(fileData, 0, fileLength);
        dataOut.flush();
        
    }
}