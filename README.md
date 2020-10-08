# Multi-image uploader

The Multi-image uploader is an application written for ITV so that they can upload and host publically addressable images.

# New Features!

  - Can upload multiple files

You can also:
  - Upload individual files

### Tech

This application uses the following:

* [AngularJS] - HTML enhanced for web apps!
* [Formidable](https://formidable.com/) - A Node.js module for parsing form data, especially file uploads.
* [node.js] - evented I/O for the backend
* [ejs](https://ejs.co/) - Embedded JavaScript templating.
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [jQuery] - duh

### Installation

Multi-image uploader requires [Node.js](https://nodejs.org/) v4+ to run.

Set up a new GCP project and create a new Compute Engine VM Instance.
* Configure the VM to use ubuntu-1804 as a boot disk
* Allow HTTP and HTTPS traffic
### Setting up Node.js
Once the box is up and running, SSH onto it and run the following commands:
```sh
$sudo apt update
$sudo apt install nodejs
$sudo apt install npm
```
The commands above will update the local packages, then install Node JS and NPM.

You can check which version of Node JS is installed by typing
```sh
$ nodejs -v
```
### Setting up MongoDB
Now that we have set up nodejs and npm, we need to install MongoDB. Follow the steps below:

Add the key: (without the key, the repository will not load)
```sh
$ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 4B7C549A058F8B6B
```
Now, create a new MongoDB repository list file:
```sh
$ echo "deb [arch=amd64] http://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
```
Complete the installation with update of repositories then install:
```sh
$ sudo apt update
$ sudo apt install mongodb-org
```
Enable and start mongod server service:
```sh
$ systemctl enable mongod.service
$ systemctl start mongod.service
```

You can check the version of MongoDB using:
```sh
$ mongo --version
```

You can also check if the service has started by doing the following:
```sh
$ systemctl status mongod.service 
```
### Getting the application files
Now we need to get the files required for the application to work. To do that use:
```sh
$git clone https://github.com/Moonie8t7/multi-image-uploader
```
Once that has been cloned, go into the folder and create a new folder called files which is where we will store the uploaded images.
```sh
$ cd multi-image uploader
$ mkdir files
```
### Installing dependencies
Now we need to install the dependencies: EJS, Express and Formidable. To do that use the following commands:
```sh
$ sudo npm install express
$ sudo npm install formidable
$ sudo npm install ejs
```
### Setting the application up to run as a Daemon
We're now going to set up PM2 which is a daemon process manager that will help  manage and keep the application online 24/7.
The following command will install the lateast version of PM2 on the server
```sh
$ sudo npm install pm2@latest -g
```

Now run the following command to run the application, server.js in the background:
```sh
$pm2 start server.js
```
You will now see a table that should have the app name as Server and tell you which user it is under and what status it currently has.

PM2 automatically assigns an App name based on the name of the .js file and a PM2 ID. PM2 also maintains other info such as the PID of the process, its current status and memory usage.

Applications that are running under PM2 will be restarted automatically if the App crashes or is killed, but we will be taking an additional step to get the application to launch on system startup (incase the VM restarts for any reason). We will do this using the startup subcommand which generates and configures a startup script to launch PM2 and its managed processes on server boots. That command is:

```sh
$ pm2 startup systemd
```

The last line of the resulting output will include a command to run with superuser priviledges in order to set PM2 to start on boot. That command will look something like:
```sh
$ sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u USER --hp /home/USER
```
(replace the USER with your username on the box)

As an additional step, we can save the PM2 process list and corresponding environments by using a save command:
```sh
$ pm2 save
```

You ahve now created a systemd *unit* that runs pm2 for your user on boot. This pm2 instance, in turn, runs server.js.

You can start the service with the following command:
```sh
$ sudo systemctl start pm2-USER
```
And check the status of the service using:
```sh
$ systemctl status pm2-USER
```

If you ever get an error message like:
```sh
Job for pm2-something failed because the service did not take the steps required by its unit configuration.
See "systemctl status pm2-something" and "journalctl -xe" for details.
```
Issue the command:
```sh
$ sudo reboot
```

### Other PM2 Commands
| Command | What it does |
| ----- | ----- |
| pm2 stop **app_name_or_id** | Stops the application |
| pm2 restart **app_name_or_id** | Restarts the application |
| pm2 list | List any applications that are being managed by PM2 |
| pm2 info **app_name** | Get information about a specific application using its App name|
| pm2 monit | Displays the App status, CPU and Memory usage |

### Installing Nginx

First update the current packages and install nginx.
```sh
$ apt update
$ apt install nginx
```
Then disable the default virtual host that comes pre-configured when Nginx is installed via Ubuntu's packet manager apt:
```sh
$ unlink /etc/nginx/sites-enabled/default
```
Then enter the sites-available directory and create a reverse proxy config file
```sh
$ cd /etc/nginx/sites-enabled/default
$ sudo nano reverse-proxy.conf
```
Paste the following Nginx config into the text editor. The proxy server redirects all incomming connections on port 80 to the server, listening on port 3000. 
```sh
server {
        listen 80;
        listen [::]:80;

        access_log /var/log/nginx/reverse-access.log;
        error_log /var/log/nginx/reverse-error.log;

        location / {
                    proxy_pass http://127.0.0.1:3000;
  }
}
```
Save and exit the text editor.
Now we need to copy the config file from /etc/nginx/sites-available to /etc/nginx/sites-enabled. The best way to do this is to use a symbolic link:
```sh
$ ln -s /etc/nginx/sites-available/reverse-proxy.conf /etc/nginx/sites-enabled/reverse-proxy.conf
```
Now we can test the configuration file using the following command:
```sh
nginx -t
```
This should return:
```sh
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Now we have set up the reverse proxy and tested it to make sure that the config file is correct, we need to restart Nginx to have it apply the new proxy config file. To do this use the command to gracefully shutdown and restart it:
```sh
$ sudo systemctl reload nginx
```

### Todos

 - Add backend management for Images to remove the need to SSH onto the box

License
----

MIT


**Free Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [john gruber]: <http://daringfireball.net>
   [node.js]: <http://nodejs.org>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>
