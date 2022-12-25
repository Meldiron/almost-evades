TODO:
- upgrades
- abilities
- more maps
- leaderboard
- reward for win + profiles
- speed 1.1 on enemy in 5,6,7,..
- stroke on players+enemies to better see
- player layer above enemy layer
- bigger enemy more in background
- Cannot kill on spawn
- claim anonymous account
- Dont disconenct from lobby on /r

```sh
# Machine setup
curl -fsSL https://deb.nodesource.com/setup_19.x | bash - && apt-get install -y nodejs

# SSL setup
sudo snap install core; sudo snap refresh core
sudo snap set certbot trust-plugin-with-root=ok
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

sudo apt install -y nginx

nano /etc/nginx/sites-available/eu1.evades.almostapps.eu

# Code to put into:
# server {
#     listen 80;
#     listen [::]:80;
#     server_name eu1.evades.almostapps.eu;

#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_set_header Host $host;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     }
# }

ln -s /etc/nginx/sites-available/eu1.evades.almostapps.eu /etc/nginx/sites-enabled/eu1.evades.almostapps.eu
sudo service nginx reload
sudo snap install certbot-dns-google

certbot

sudo service nginx reload

# Project setup
git clone https://github.com/Meldiron/almost-evades.git
cd almost-evades/backend/colyseus-server
npm install

# Production setup
cp .env.example .env
nano .env # (api_key)
npm run build

# Server start
screen -S colyseus
node lib/index.js
```

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
