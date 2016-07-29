# Red Helper

Redmine time entries helper

## Pre Requisites

#### Install and run Selenium Standalone with node
    
    $ npm install -g selenium-standalone
    $ selenium-standalone install
    $ selenium-standalone start
    

## Installation

    git clone https://github.com/dylanrevisited/red-helper.git    
    cd red-helper
    npm install
    cp local.example.js config/local.js
    cp entries.example.csv entries.csv


## Accepted CSV Format

The entries.csv file accepts the following format 

      ticket,date,hours,comment,activity
      
      6252,07-18,4,"DESCRIPTION",Development
      6252,,2,"DESCRIPTION",Development
      6252,,2,"DESCRIPTION",Development
      
      6252,07-19,4,"DESCRIPTION",Development
      6252,,2,"DESCRIPTION",Development
      6252,,2,"DESCRIPTION",Development
      
You can skip the date if it's the same as the previous entry. The two accepted
date formats are YYYY-MM-DD and MM-DD defaulting to the current year.

You can't use this tool to log more than 8 hours a day or log time in weekends.

You can leave empty lines between entries.

## Usage

#### Update entries.csv

Update the source file with your time entries

#### Config

Make sure your username and password is up to date in config/local.json
Also be sure to provide the proper base url.

#### Start the Selenium standalone server

      selenium-standalone start

#### Run tests

      npm start

If the run fails, make sure to review the entries that were logged and delete 
them before attempting to log them again.

After login, the suite pauses for 10 seconds before start time entries submission,
you can kill the process before any data gets committed in case you 
accidentally submit the suite