Mü-Chat
======
```html                          
            __   __                                           
           /\_\ /\_\                                       
           \/_/ \/_/                                          
  __    __     __  __                                                                 
 /\ "-./  \   /\ \/\ \                                       
 \ \ \-./\ \  \ \ \_\ \                                                 
  \ \_\ \ \_\  \ \_____\                                               
   \/_/  \/_/   \/_____/                                      
                    ______     __  __     ______     ______  
                   /\  ___\   /\ \_\ \   /\  __ \   /\__  _\ 
                   \ \ \____  \ \  __ \  \ \  __ \  \/_/\ \/      
                    \ \_____\  \ \_\ \_\  \ \_\ \_\    \ \_\ 
                     \/_____/   \/_/\/_/   \/_/\/_/     \/_/  
                                                     
                                                            
                                                                 
                                                                 
  /\/\                            
=( - -)=   "Chat awhile."                               v2.0   
```

Running
------
The production site runs on **port 80**.

1. From the project root, execute:
   
   $ `npm run build && npm run server`

2. Go to http://[hostname]:80.

*NB: I haven't actually done any work to set up the Webpack build for production yet (AKA there's something weird with the CSS, the JavaScript bundle is huge... and other delights I'm sure).*


Developing
------
To use Webpack in development you need to run two servers:

The Webpack dev server runs on **port 8080, _and that is where the site will be available while developing_**.  
The Express/Socket.IO server runs on 8081. 

1. From the project root, execute:

   $ `npm run server`  
   $ `npm run dev-client`

2. Go to http://[hostname]:8080.