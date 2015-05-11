#!/bin/bash

appEnv=$(curl -XGET localhost:8000/sitecontact.env); 
if [ -z "$appEnv" ]
then 
    echo "Could not get config "  && exit 1
else 
    echo $appEnv pm2 start processes.json | bash; 
fi
